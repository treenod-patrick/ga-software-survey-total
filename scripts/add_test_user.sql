-- ============================================================================
-- 테스트 사용자 추가 (software_assignments)
-- ============================================================================

-- 테스트 사용자 이메일
-- test.user@treenod.com 사용자에게 여러 소프트웨어 할당

INSERT INTO software_assignments (user_email, category, product, is_all_products_pack, is_active)
VALUES
  -- Jetbrain 제품들
  ('test.user@treenod.com', 'Jetbrain', 'IntelliJ IDEA', false, true),
  ('test.user@treenod.com', 'Jetbrain', 'PyCharm', false, true),
  ('test.user@treenod.com', 'Jetbrain', 'WebStorm', false, true),

  -- Autodesk 제품
  ('test.user@treenod.com', 'Autodesk', '3ds Max', false, true),
  ('test.user@treenod.com', 'Autodesk', 'Maya', false, true),

  -- Shutterstock 제품
  ('test.user@treenod.com', 'Shutterstock', 'Images', false, true),

  -- spine 제품
  ('test.user@treenod.com', 'spine', 'Spine Professional', false, true)

ON CONFLICT (user_email, category, product)
DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- ============================================================================
-- All Products Pack 사용자 추가 예시
-- ============================================================================

-- test.admin@treenod.com 사용자에게 Jetbrain All Products Pack 할당
INSERT INTO software_assignments (user_email, category, product, is_all_products_pack, is_active)
VALUES
  ('test.admin@treenod.com', 'Jetbrain', 'All Products Pack', true, true)
ON CONFLICT (user_email, category, product)
DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- ============================================================================
-- 확인 쿼리
-- ============================================================================

-- 추가된 사용자 확인
SELECT
  user_email,
  category,
  product,
  is_all_products_pack,
  is_active,
  created_at
FROM software_assignments
WHERE user_email IN ('test.user@treenod.com', 'test.admin@treenod.com')
ORDER BY user_email, category, product;
