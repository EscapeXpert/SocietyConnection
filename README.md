# SocietyConnection

Node.js와 Express.js로 구현한 동아리 홈페이지입니다.

## Getting Started / 어떻게 시작하나요?

아래의 명령어로 서버를 실행하시면 됩니다.
```
npm start
```

### Prerequisites / 선행 조건

아래 사항들이 설치가 되어있어야 하며 카카오 로그인을 사용하기 위해서 카카오 REST API 키를 발급하셔야 합니다.

```
MySQL Server, Node.js, npm
```

### 모듈 설치
아래의 명령어로 필요한 모듈들을 설치합니다.

```
npm install
```

### 카카오 REST API 키 발급 및 설정
1. [Kakao Developers](https://developers.kakao.com/) 사이트에 접속하여 로그인 후 앱 이름과 사업자명을 작성 후 저장합니다.


2. 카카오 로그인을 활성화 후 닉네임, 프로필 사진 필수 동의 및 카카오계정, 성별, 연령대, 생일 선택 동의로 설정합니다.

## Built With / 누구랑 만들었나요?

* [박세훈](https://github.com/psh3253) - 프로젝트 및 DB 설계, 게시판 기능 구현 및 디자인 등
* [김민수](https://github.com/munis-kim) - 프로젝트 및 DB 설계, 쪽지 기능 구현 및 디자인 등
* [마상균](https://github.com/wodon326) - 프로젝트 및 DB 설계, 인증, 프로필, 관리 기능 구현 및 디자인 등

## Function / 기능
+ 로그인 및 회원가입
+ 카카오 계정을 이용한 소셜 로그인
+ 일반 게시판
+ 모집 전용 게시판
+ 프로필 보기 및 수정
+ 홈페이지 관리
+ 쪽지

## Technology / 기술

+ Multer을 사용하여 사진 및 첨부파일 저장
+ Kakao Rest API를 사용하여 카카오 로그인
+ Sequelize ORM을 사용하여 데이터베이스를 손쉽게 관리

## License / 라이센스

이 프로젝트는 GPL-3.0 라이센스로 라이센스가 부여되어 있습니다. 자세한 내용은 LICENSE 파일을 참고하세요.