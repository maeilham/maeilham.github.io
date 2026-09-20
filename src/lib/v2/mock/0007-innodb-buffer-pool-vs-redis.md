둘은 **캐시하는 대상이 다릅니다.** InnoDB 버퍼 풀은 디스크에서 읽은 **데이터·인덱스 페이지**를 메모리에 올려두어 디스크 I/O를 줄이고, Redis는 **가공이 끝난 결과값**을 키로 저장해 쿼리 실행 자체를 건너뜁니다.

## 버퍼 풀이 해주는 일

InnoDB는 페이지(기본 16KB) 단위로 데이터를 읽고, 자주 쓰는 페이지를 버퍼 풀에 유지합니다. 덕분에 같은 페이지를 다시 읽을 때 디스크에 가지 않습니다. 하지만 페이지가 메모리에 있어도 다음 비용은 그대로 남습니다.

- SQL 파싱, 옵티마이저의 실행 계획 수립
- B+Tree 인덱스 탐색과 row 조립, 격리 수준에 따른 MVCC 처리
- 조인, 정렬, 집계 같은 **계산**
- 애플리케이션과 DB 사이의 커넥션과 네트워크 왕복

> MySQL 8.0부터 쿼리 캐시는 제거되어, "쿼리 결과"를 DB가 대신 캐시해주지 않습니다.

## Redis를 썼을 때 얻는 이득

1. **계산을 건너뜁니다.** 무거운 조인·집계 쿼리의 결과를 저장해두면, 같은 요청은 키 조회 한 번으로 끝납니다. 버퍼 풀은 I/O만 줄일 뿐 계산 비용은 줄이지 못합니다.
2. **DB로 가는 요청 자체가 줄어듭니다.** 읽기 트래픽이 DB의 커넥션과 CPU까지 도달하지 않아, 같은 DB로 더 많은 사용자를 받을 수 있습니다.
3. **수평 확장이 됩니다.** 버퍼 풀은 DB 서버 한 대의 메모리 크기에 묶이지만, Redis는 노드를 늘리거나 클러스터로 구성해 확장할 수 있습니다.
4. **필요한 값만 캐시합니다.** row 하나를 읽어도 페이지 전체(16KB)가 버퍼 풀을 차지합니다. 접근이 드문드문 흩어져 있으면 캐시 효율이 떨어지는데, Redis는 값 단위로 저장합니다.
5. **다양한 자료구조와 TTL을 씁니다.** 세션, 랭킹(sorted set), 카운터, 요청 제한처럼 DB 캐시로는 표현하기 어려운 용도를 다룰 수 있습니다.

| | InnoDB 버퍼 풀 | Redis 캐시 |
|---|---|---|
| 캐시 단위 | 데이터·인덱스 페이지 (기본 16KB) | 키-값 (가공된 결과) |
| 줄여주는 비용 | 디스크 I/O | 쿼리 실행, 계산, DB 커넥션 |
| 위치 | DB 서버 메모리 | 별도 서버 (네트워크 왕복) |
| 확장 | DB 서버 메모리에 종속 | 노드 추가로 수평 확장 |
| 무효화 | DB가 자동으로 관리 | 애플리케이션이 직접 관리 |

가장 흔한 사용 방식은 **cache-aside**입니다.

```go
func GetUser(ctx context.Context, id int64) (*User, error) {
    key := fmt.Sprintf("user:%d", id)
    if v, err := rdb.Get(ctx, key).Result(); err == nil {
        return decode(v), nil // 캐시 히트: DB를 거치지 않음
    }
    u, err := db.QueryUser(ctx, id) // 캐시 미스: DB 조회
    if err != nil {
        return nil, err
    }
    rdb.Set(ctx, key, encode(u), 10*time.Minute) // TTL로 오래된 값 정리
    return u, nil
}
```

## 주의할 점

Redis는 공짜가 아닙니다. 원본과 캐시가 어긋나는 **일관성 문제**(무효화 시점), 캐시가 한꺼번에 만료될 때 DB로 요청이 몰리는 **스탬피드**, 운영해야 할 시스템이 하나 늘어나는 비용이 따라옵니다.

그래서 실무에서는 먼저 버퍼 풀이 충분한지 확인합니다. 아래 두 값의 비율로 버퍼 풀 히트율을 볼 수 있고, 히트율이 충분히 높은데도 DB가 느리다면 병목은 I/O가 아니라 쿼리 실행이나 커넥션 쪽일 가능성이 큽니다.

```sql
SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_read%';
-- Innodb_buffer_pool_read_requests: 버퍼 풀에 요청한 논리적 읽기 횟수
-- Innodb_buffer_pool_reads: 버퍼 풀에 없어 디스크에서 읽은 횟수
```

인덱스와 쿼리를 먼저 튜닝하고, 그래도 같은 결과를 반복해서 계산하는 부하가 남을 때 Redis를 도입하는 순서가 안전합니다.

## 참고

- [MySQL 공식 문서 — InnoDB Buffer Pool](https://dev.mysql.com/doc/refman/8.0/en/innodb-buffer-pool.html)
- [Redis 공식 문서 — Client-side caching / Caching patterns](https://redis.io/docs/latest/develop/)
