// 통합 테스트 전용 SQLite DB 경로를 환경변수로 지정
// 이 파일은 jest.config에서 globalSetup으로 실행됨
process.env.DATABASE_URL = "file:./prisma/test.db";
process.env.JWT_SECRET = "test-secret-key";
