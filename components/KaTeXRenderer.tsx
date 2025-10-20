// components/KaTeXRenderer.tsx
import katex from 'katex';
import React from 'react';

interface KaTeXRendererProps {
  latex: string;
  className?: string;
  displayMode?: boolean; // true for block mode (like $$...$$), false for inline mode
}

const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({ latex, className, displayMode = false }) => {
  const renderMixedContent = (text: string): string => {
    // 处理混合内容：文本中的 $...$ 和 $$...$$ 公式
    return text.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula, {
          throwOnError: false,
          displayMode: true,
        });
      } catch (e) {
        console.error("KaTeX Block Formula Error:", e);
        return `<span style="color: red;">[块公式渲染错误]</span>`;
      }
    }).replace(/\$([^$]+)\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula, {
          throwOnError: false,
          displayMode: false,
        });
      } catch (e) {
        console.error("KaTeX Inline Formula Error:", e);
        return `<span style="color: red;">[行内公式渲染错误]</span>`;
      }
    });
  };

  const html = React.useMemo(() => {
    // 如果包含 $ 符号，处理混合内容
    if (latex.includes('$')) {
      return renderMixedContent(latex);
    }
    
    // 否则直接渲染纯LaTeX
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: displayMode,
        strict: false,
        trust: true,
        macros: {
          "\\f": "#1f(#2)",
        }
      });
    } catch (e) {
      console.error("KaTeX Rendering Error:", e);
      return `<span style="color: red;">[公式渲染错误: ${latex}]</span>`;
    }
  }, [latex, displayMode]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default KaTeXRenderer;