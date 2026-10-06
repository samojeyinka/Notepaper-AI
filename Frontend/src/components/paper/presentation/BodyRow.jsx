import { useState } from "react";
import { RichBodyField } from "./editableFields";
import { LIMITS } from "./themes";

// Editable body row (bullet/numbered point or paragraph).
export const BodyRow = ({ value, index, total, listStyle, onChange, onRemove, color, dotColor, fontSize, lineHeight }) => {
    const [hovered, setHovered] = useState(false);
    const hasValue   = value?.trim().length > 0;
    const showMarker = listStyle !== 'text' && hasValue;
    return (
        <div className="flex items-start gap-2 group/bullet"
            onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
            {listStyle !== 'text' && (
                <span style={{ color:dotColor, fontSize, fontWeight:listStyle==='numbered'?700:400, lineHeight, flexShrink:0, minWidth:listStyle==='numbered'?22:12, marginTop:2, opacity:showMarker?1:0, transition:'opacity 0.15s' }}>
                    {listStyle==='numbered' ? `${index+1}.` : '•'}
                </span>
            )}
            <RichBodyField value={value} onChange={onChange} max={LIMITS.body}
                placeholder={listStyle==='text' ? `Paragraph ${index+1}…` : `Point ${index+1}…`}
                style={{ color, fontSize, lineHeight }}
            />
            {total > 1 && hovered && (
                <button onClick={onRemove}
                    className="w-5 h-5 mt-1 rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={{ background:'rgba(239,68,68,0.15)', color:'#ef4444' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.3)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.15)'}>
                    <span className="material-icons-round text-[12px]">close</span>
                </button>
            )}
        </div>
    );
};