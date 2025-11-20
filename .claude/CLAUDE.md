# Software Survey 프로젝트 메모

## 프로젝트 개요

이 프로젝트는 **Adobe 설문과는 무관**합니다.
Treenod 소프트웨어 라이선스 관리 및 사용 현황 설문 시스템입니다.

## Supabase 데이터베이스 구조

### ✅ 현재 프로젝트 관련 테이블 (유지)

#### 1. `gws_assignments` (88개 레코드)
- **목적**: Google Workspace 할당 정보
- **컬럼**: id, email, is_active, created_at, updated_at
- **특징**: Adobe와 무관

#### 2. `software_survey_responses` (1개 레코드)
- **목적**: 소프트웨어 사용 설문 응답
- **컬럼**: id, user_email, category_responses, submitted_at
- **데이터 예시**:
  - Shutterstock
  - Jetbrain (Rider)
  - spine
- **특징**: Adobe와 무관, 다양한 소프트웨어 카테고리 포함

#### 3. `software_assignments` (59개 레코드)
- **목적**: JetBrains 제품 라이선스 할당
- **컬럼**: id, user_email, category, product, is_all_products_pack, is_active, created_at, updated_at
- **데이터 예시**: "Rider - Commercial annual subscription"
- **특징**: Adobe와 무관

#### 4. `users` (3개 레코드)
- **목적**: 사용자 기본 정보
- **컬럼**: id, user_name, user_full_name, user_domain, department_id, user_home, created_at, updated_at

---

### ⚠️ Adobe 관련 테이블 (삭제 고려 대상)

#### `survey_responses` (76개 레코드)
- **목적**: Adobe Creative Cloud 설문 전용
- **컬럼**:
  - id, user_id, user_email, department, role
  - `software_usage` - Adobe Photoshop, Illustrator 등
  - `creative_cloud_usage_count`
  - `is_creative_cloud_compliant`
  - `selected_software_list`
  - additional_comments, submitted_at
- **데이터 예시**:
  - Adobe Photoshop (76명 전원 사용)
  - Adobe Illustrator (28명)
  - Adobe After Effects (21명)
  - Adobe Premiere Pro (17명)
- **특징**: **100% Adobe Creative Cloud 전용 설문 데이터**
- **삭제 시 영향**: 현재 프로젝트에 영향 없음

---

## 중요 참고사항

1. **Adobe 설문 데이터는 현재 프로젝트와 무관함**
2. `survey_responses` 테이블은 삭제해도 현재 프로젝트에 영향 없음
3. 현재 프로젝트는 다양한 소프트웨어(JetBrains, Shutterstock, spine 등)를 다룸
4. Adobe 관련 분석/통계는 무시할 것
5. 데이터 조회 시 `survey_responses` 테이블은 읽지 말 것

---

## 테이블 관계도

```
현재 프로젝트:
├─ gws_assignments (GWS 할당)
├─ software_assignments (JetBrains 라이선스)
├─ software_survey_responses (전체 소프트웨어 설문)
└─ users (사용자 정보)

Adobe 설문 (별도/무관):
└─ survey_responses (삭제 고려 대상)
```

---

## 마지막 업데이트
2025-11-20
