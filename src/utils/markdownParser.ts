/**
 * Markdown 파싱 유틸리티 함수
 * LLM이 생성한 Markdown을 구조화된 데이터로 변환
 */

export interface StrategyItem {
  title: string;
  content: string;
  effect: string;
}

export interface ParsedAnalysis {
  rawMarkdown: string;
  sections: {
    priceComparison: string;
    pdlInsights: string;
    strategies: StrategyItem[];
  };
  oneLiner: string;
  createdAt: string;
}

/**
 * Markdown에서 특정 섹션 추출
 */
export function extractSection(markdown: string, sectionTitle: string): string {
  // 섹션 제목부터 다음 섹션 또는 끝까지 추출
  const escapedTitle = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escapedTitle}[\\s\\S]*?(?=\\n##\\s|$)`, 'i');
  const match = markdown.match(regex);
  return match ? match[0].trim() : '';
}

/**
 * 한 줄 요약 추출
 */
export function extractOneLiner(markdown: string): string {
  // "총 좌석 수는..." 패턴 찾기
  const patterns = [
    /총 좌석 수는.*?[.。]/s,
    /총.*?감소.*?[.。]/s,
    /\*\*핵심 요약\*\*[:\s]*(.+?)[.。]/s,
  ];

  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match) {
      return match[0].trim().replace(/^\*\*핵심 요약\*\*[:\s]*/, '');
    }
  }

  return '분석 결과를 확인하세요.';
}

/**
 * 구매 전략 파싱
 */
export function parseStrategies(markdown: string): StrategyItem[] {
  const strategiesSection = extractSection(markdown, '3\\) 구매 전략 제안');

  // 전략 패턴 매칭
  // - 전략 1: 제목
  //   - 내용: ...
  //   - 기대 효과: ...
  const strategyRegex = /-\s*전략\s*\d+:\s*(.+?)\n\s*-\s*내용:\s*(.+?)\n\s*-\s*기대\s*효과:\s*(.+?)(?=\n\n|-\s*전략|$)/gs;

  const strategies: StrategyItem[] = [];
  let match;

  while ((match = strategyRegex.exec(strategiesSection)) !== null) {
    strategies.push({
      title: match[1].trim(),
      content: match[2].trim(),
      effect: match[3].trim(),
    });
  }

  // 대체 패턴: ### 전략 형식
  if (strategies.length === 0) {
    const altRegex = /###\s*전략\s*\d+:\s*(.+?)\n\n\*\*내용\*\*:\s*(.+?)\n\n\*\*기대\s*효과\*\*:\s*(.+?)(?=\n\n###|$)/gs;
    while ((match = altRegex.exec(strategiesSection)) !== null) {
      strategies.push({
        title: match[1].trim(),
        content: match[2].trim(),
        effect: match[3].trim(),
      });
    }
  }

  return strategies;
}

/**
 * 차트 데이터 생성
 */
export interface ChartDataItem {
  edition: string;
  '2024': number;
  '2025': number;
}

export function generateChartData(
  baseline2024: any[],
  survey2025: any
): ChartDataItem[] {
  const baseline2024Map = baseline2024.reduce((acc, item) => {
    acc[item.edition] = item.seats;
    return acc;
  }, {} as Record<string, number>);

  return [
    {
      edition: 'Starter',
      '2024': baseline2024Map['Business Starter'] || 0,
      '2025': survey2025.starter_seats || 0,
    },
    {
      edition: 'Standard',
      '2024': baseline2024Map['Business Standard'] || 0,
      '2025': survey2025.standard_seats || 0,
    },
    {
      edition: 'Enterprise',
      '2024': baseline2024Map['Enterprise Standard'] || 0,
      '2025': survey2025.enterprise_seats || 0,
    },
  ];
}

/**
 * 분석 데이터 파싱
 */
export function parseAnalysisData(data: any): ParsedAnalysis {
  const markdown = data.llm_raw_markdown || '';

  return {
    rawMarkdown: markdown,
    sections: {
      priceComparison: extractSection(markdown, '1\\) 단가.*?금액 비교'),
      pdlInsights: extractSection(markdown, '2\\) PDL'),
      strategies: parseStrategies(markdown),
    },
    oneLiner: data.summary_one_liner || extractOneLiner(markdown),
    createdAt: data.created_at,
  };
}

/**
 * 숫자 포맷팅 유틸리티
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

export function formatCurrency(num: number): string {
  return `₩${formatNumber(num)}`;
}

export function formatPercent(num: number): string {
  return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
}
