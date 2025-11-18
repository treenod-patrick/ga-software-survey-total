-- survey_responses 테이블의 실제 컬럼 정보 조회
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'survey_responses'
ORDER BY 
    ordinal_position;

-- 샘플 데이터 조회 (모든 컬럼)
SELECT * FROM survey_responses LIMIT 1;
