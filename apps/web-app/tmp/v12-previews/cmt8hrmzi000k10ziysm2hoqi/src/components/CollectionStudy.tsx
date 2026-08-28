import { PointerEvent, useRef } from 'react';
type Study = {
    index: string;
    name: string;
    tone: string;
    copy: string;
};
export const studies: Study[] = [
    { index: 'I', name: 'Obsidian', tone: '#d5b366', copy: 'A dark architectural study with warm metallic light.' },
    { index: 'II', name: 'Nocturne', tone: '#b7c6ca', copy: 'A cool interpretation shaped by shadow and reflection.' },
    { index: 'III', name: 'Aureum', tone: '#e2c37b', copy: 'A luminous expression of the Aeternum silhouette.' }
];
export function CollectionStudy({ study }: {
    study: Study;
}) {
    const ref = useRef<HTMLArticleElement>(null);
    const move = (e: PointerEvent<HTMLElement>) => {
        const el = ref.current;
        if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches)
            return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        el.style.setProperty('--rx', `${-y * 7}deg`);
        el.style.setProperty('--ry', `${x * 9}deg`);
        el.style.setProperty('--lx', `${50 + x * 45}%`);
        el.style.setProperty('--ly', `${45 + y * 35}%`);
    };
    const leave = () => {
        ref.current?.style.setProperty('--rx', '0deg');
        ref.current?.style.setProperty('--ry', '0deg');
    };
    return <article ref={ref} className="collection-study" onPointerMove={move} onPointerLeave={leave} style={{ '--tone': study.tone } as React.CSSProperties} data-buildez-id="be-7ceadae7f83f2f" data-buildez-kind="element" data-buildez-source-file="src/components/CollectionStudy.tsx" data-buildez-source-anchor="1252" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60">
    <div className="study-visual" data-buildez-id="be-2707e0c1d5048c" data-buildez-kind="element" data-buildez-source-file="src/components/CollectionStudy.tsx" data-buildez-source-anchor="1405" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60">
      <div className="mini-watch" data-buildez-id="be-ad1db24742dda9" data-buildez-kind="element" data-buildez-source-file="src/components/CollectionStudy.tsx" data-buildez-source-anchor="1442" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60"><i className="mini-crown" data-buildez-id="be-d3b90531c83706" data-buildez-kind="element" data-buildez-source-file="src/components/CollectionStudy.tsx" data-buildez-source-anchor="1470" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60"/><span className="hand one" data-buildez-id="be-d70c8f4f2b80aa" data-buildez-kind="element" data-buildez-source-file="src/components/CollectionStudy.tsx" data-buildez-source-anchor="1498" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="60"/><span className="hand two" data-buildez-id="be-d087690c678718" data-buildez-kind="element" data-buildez-source-file="src/components/CollectionStudy.tsx" data-buildez-source-anchor="1527" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="60"/>{Array.from({ length: 12 }, (_, i) => <b key={i} style={{ transform: `rotate(${i * 30}deg)` }} data-buildez-id="be-52731e5da7c7cc" data-buildez-kind="element" data-buildez-source-file="src/components/CollectionStudy.tsx" data-buildez-source-anchor="1594" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60"/>)}</div>
    </div>
    <div className="study-caption" data-buildez-id="be-314fba7d0b2cf4" data-buildez-kind="element" data-buildez-source-file="src/components/CollectionStudy.tsx" data-buildez-source-anchor="1677" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60"><span data-buildez-id="be-4e0125e35103f6" data-buildez-kind="element" data-buildez-source-file="src/components/CollectionStudy.tsx" data-buildez-source-anchor="1708" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="60">{study.index}</span><div data-buildez-id="be-3f6d2e2b4d5971" data-buildez-kind="element" data-buildez-source-file="src/components/CollectionStudy.tsx" data-buildez-source-anchor="1734" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60"><h2 data-buildez-id="be-e065d4106bc69a" data-buildez-kind="element" data-buildez-source-file="src/components/CollectionStudy.tsx" data-buildez-source-anchor="1739" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="60">{study.name}</h2><p data-buildez-id="be-3c3f79bff41489" data-buildez-kind="element" data-buildez-source-file="src/components/CollectionStudy.tsx" data-buildez-source-anchor="1760" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="60">{study.copy}</p></div></div>
  </article>;
}
