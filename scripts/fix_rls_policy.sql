-- software_assignments 테이블의 RLS 정책 수정
-- 관리자 대시보드가 모든 데이터를 볼 수 있도록 설정

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Enable read access for all users" ON software_assignments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON software_assignments;

-- 새로운 정책 생성: 모든 인증된 사용자가 조회 가능
CREATE POLICY "Enable read access for authenticated users"
ON software_assignments
FOR SELECT
TO authenticated
USING (true);

-- 또는 더 간단하게: RLS를 비활성화 (보안이 덜 중요한 경우)
-- ALTER TABLE software_assignments DISABLE ROW LEVEL SECURITY;
