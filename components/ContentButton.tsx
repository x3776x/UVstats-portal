import React from 'react';

interface ContentButton {
    title: string;
}

export default function ContentButton ({ title }: ContentButton) {
    return (
        <button className="content-button">
            {title}
        </button>
    )
    
}