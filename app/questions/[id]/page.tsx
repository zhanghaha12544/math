// app/questions/[id]/page.tsx
import KaTeXRenderer from '@/components/KaTeXRenderer';

const MOCK_QUESTION = {
  id: 1,
  title: '2023年数学一第1题（极限计算）',
  meta: { year: 2023, subject: '数学一', chapter: '高等数学', topic: '极限与连续' },
  content:
    '求极限：lim_{x→0} (x - sin x)/x³。',
  solutionSteps: [
    {
      step: '一、分析问题',
      text: '这是一个 0/0 型未定式，需要使用泰勒展开或洛必达法则求解。',
      latex:
        '\\lim_{x \\to 0} \\frac{x - \\sin x}{x^3} \\quad \\text{（} \\frac{0}{0} \\text{ 型未定式）}',
    },
    {
      step: '二、泰勒展开',
      text: '使用 sin x 的泰勒展开：',
      latex: '\\sin x = x - \\frac{x^3}{6} + \\frac{x^5}{120} - \\frac{x^7}{5040} + \\cdots',
    },
    {
      step: '三、代入计算',
      text: '将泰勒展开代入原式进行计算：',
      latex: '\\begin{align} x - \\sin x &= x - \\left(x - \\frac{x^3}{6} + \\frac{x^5}{120} - \\cdots\\right) \\\\ &= x - x + \\frac{x^3}{6} - \\frac{x^5}{120} + \\cdots \\\\ &= \\frac{x^3}{6} + o(x^3) \\end{align}',
    },
    {
      step: '四、计算极限',
      text: '将泰勒展开结果代入原极限，得到最终答案。',
      latex: '\\begin{align} \\lim_{x \\to 0} \\frac{x - \\sin x}{x^3} &= \\lim_{x \\to 0} \\frac{\\frac{x^3}{6} + o(x^3)}{x^3} \\\\ &= \\lim_{x \\to 0} \\left(\\frac{1}{6} + \\frac{o(x^3)}{x^3}\\right) \\\\ &= \\frac{1}{6} + 0 \\\\ &= \\frac{1}{6} \\end{align}',
    },
  ],
};

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const q = MOCK_QUESTION;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6 space-x-2">
        {Object.entries(q.meta).map(([key, value]) => (
          <span
            key={key}
            className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-800"
          >
            {value}
          </span>
        ))}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-3">{q.title}</h1>
      <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-3">原题：</h2>
        <KaTeXRenderer latex={q.content} displayMode={true} className="text-xl leading-relaxed" />
      </div>

      <h2 className="text-2xl font-bold text-indigo-700 mb-6 mt-10">详细解析</h2>
      <div className="space-y-8">
        {q.solutionSteps.map((step, index) => (
          <div key={index} className="border-l-4 border-indigo-400 pl-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.step}</h3>
            <p className="text-gray-600 mb-3">{step.text}</p>
            <div className="bg-white p-4 rounded-md border shadow-sm overflow-x-auto">
              <KaTeXRenderer latex={step.latex} displayMode={true} className="text-lg" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">用户讨论</h2>
        <p className="text-gray-500">（这里将是评论区组件）</p>
      </div>
    </div>
  );
}



