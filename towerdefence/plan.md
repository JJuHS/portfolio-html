# 시작페이지
1. 닉네임 입력받기
- '닉네임 입력해주세요' !완료
- 닉네임입력창, 자동커서 !완료
- start버튼 !완료

2. 입력받은 닉네임 로컬스토리지에 저장하기 !완료

# 메인, 상점 공통
1. 닉네임 구역
- 닉네임 표시 !완료
- 닉네임 수정 아이콘 표시 !완료
- 닉네임 수정 기능 !완료
2. 코인 구역
- 현재 가지고 있는 코인 표시 !완료
3. 메인, 상점 이동버튼
- 메인페이지 이동버튼 !완료
- 상점페이지 이동버튼 !완료

# 메인페이지
1. 라운드 리스트
- 게임 전체 표시 !완료
- 비활성화된 게임과 활성화된 게임 분리표시  TODO:자물쇠모양으로 덮어버리기
- 게임 정보 표시
- - 레벨, 별 표시
- 클릭시 게임 시작 !완료

# 상점페이지
1. 타워 업그레이드 페이지   TODO
2. 속성 업그레이드 페이지   TODO

# 게임페이지    TODO
1. 현재 라운드에서 얻은 코인 수
- 적 제압 시 마다 변경
2. 남은 적의 수
- 적 제압 시 마다 변경
3. 현재 라운드의 레벨
- 게임 시작부터 고정
4. 맵
- 게임 시작부터 고정
- 그림으로 덮기
5. 시간별로 나오는 적들
- enemies리스트에 [1,1,1,1,1,0,0,0,0,0,4,4,4,4] 이런식으로 배치 (enemy.id)
- 리스트 하나마다 1초 차이두고 나오기, 0이면 아무것도 안나오기
- 적들은 경로따라서 움직이기 -> 부드럽게 할 수 있으려나
6. 라운드 진행 시간
- 타이머
7. 중지버튼, 재시작버튼, 종료버튼, 2배속 버튼


# DATA
1. 유저정보 userStatus - local에 저장, app.js
id(str) : 닉네임
coin(int) : 보유 코인
maxlevel(int) : 라운드 돌파 현황
waterlevel, firelevel, windlevel(int) : 속성레벨
this.towerlevel(dict[towerid(int):level[int]]) : 타워별 업그레이드 된 레벨 (default = {})

2. 게임전체정보 GameData - local에 저장, app.js
level(int) : 게임 단계 -> 입력안함 자동
enemies(list) : 게임의 적들 정보
cleared(bool) : 게임 클리어 여부
stars(int0~3) : 별 개수
thimbnail(str) : 섬네일 url

3. 적 정보  TODO
id(int) : 식별 id
attribute(str) : 속성
hp(int) : 체력
speed(float) : 이동속도
level(int) : 적 계금

4. 맵 정보  TODO
board(list[8][20]:int) : 0못감, 1길
road [(int, int)] : 적의 경로
start(int,int) : 시작점 좌표
end(int, int) : 끝점 좌표

5. 타워 정보 towerData - tower.js
level(int) : 타워 정보
attribute(str) : 속성
range(int) : 사정거리
power(int) : 공격력
speed(float) : 공격속도