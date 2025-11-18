-- ============================================================================
-- software_assignments 테이블에 사용자 추가
-- 용도: 사용자에게 소프트웨어 설문 권한 부여
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 사용 방법
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. 아래 VALUES에 추가할 이메일과 소프트웨어 정보 입력
-- 2. Supabase SQL Editor에서 실행
-- 3. 해당 사용자는 즉시 /software-survey 페이지 접근 가능
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- 옵션 1: 개별 제품 할당 (가장 일반적)
-- ============================================================================

INSERT INTO software_assignments (user_email, category, product, is_all_products_pack, is_active)
VALUES
  ('your-email@example.com', 'Jetbrain', 'IntelliJ IDEA', false, true),
  ('your-email@example.com', 'Jetbrain', 'PyCharm', false, true)
ON CONFLICT (user_email, category, product)
DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- ============================================================================
-- 옵션 2: All Products Pack 할당 (전체 제품 사용 가능)
-- ============================================================================

/*
INSERT INTO software_assignments (user_email, category, product, is_all_products_pack, is_active)
VALUES
  ('your-email@example.com', 'Jetbrain', 'All Products Pack', true, true)
ON CONFLICT (user_email, category, product)
DO UPDATE SET
  is_active = true,
  updated_at = NOW();
*/

-- ============================================================================
-- 옵션 3: 여러 사용자 한번에 추가
-- ============================================================================

/*
INSERT INTO software_assignments (user_email, category, product, is_all_products_pack, is_active)
VALUES
  ('user1@example.com', 'Jetbrain', 'Rider - Commercial annual subscription', false, true),
  ('user2@example.com', 'Jetbrain', 'IntelliJ IDEA', false, true),
  ('user3@example.com', 'Jetbrain', 'All Products Pack', true, true),
  ('user4@example.com', 'Autodesk', '3ds Max', false, true),
  ('user5@example.com', 'Shutterstock', 'Images', false, true)
ON CONFLICT (user_email, category, product)
DO UPDATE SET
  is_active = true,
  updated_at = NOW();
*/

-- ============================================================================
-- 현재 사용 가능한 카테고리 및 제품 목록
-- ============================================================================

/*
현재 시스템에 등록된 카테고리:
- Jetbrain (IntelliJ IDEA, PyCharm, Rider, WebStorm, PhpStorm, All Products Pack 등)
- Autodesk (3ds Max, Maya, AutoCAD 등)
- Shutterstock (Images, Video 등)
- spine (Spine Professional, Spine Essential 등)

카테고리별 제품 전체 목록 확인:
SELECT DISTINCT category, product
FROM software_assignments
WHERE is_active = true
ORDER BY category, product;
*/

-- ============================================================================
-- 확인 쿼리
-- ============================================================================

-- 특정 사용자의 할당 소프트웨어 확인
SELECT
  user_email,
  category,
  product,
  is_all_products_pack,
  is_active,
  created_at
FROM software_assignments
WHERE user_email = 'your-email@example.com'
ORDER BY category, product;

-- ============================================================================
-- 관리 쿼리 예시
-- ============================================================================

-- 특정 사용자의 특정 제품 비활성화 (삭제 대신 비활성화 권장)
/*
UPDATE software_assignments
SET is_active = false, updated_at = NOW()
WHERE user_email = 'user@example.com'
  AND category = 'Jetbrain'
  AND product = 'IntelliJ IDEA';
*/

-- 특정 사용자의 모든 할당 비활성화
/*
UPDATE software_assignments
SET is_active = false, updated_at = NOW()
WHERE user_email = 'user@example.com';
*/

-- 특정 사용자의 할당 다시 활성화
/*
UPDATE software_assignments
SET is_active = true, updated_at = NOW()
WHERE user_email = 'user@example.com';
*/

-- 특정 할당 완전 삭제 (주의!)
/*
DELETE FROM software_assignments
WHERE user_email = 'user@example.com'
  AND category = 'Jetbrain'
  AND product = 'IntelliJ IDEA';
*/
