import React from 'react';

interface ProjectTileProps {
  title: string;
  description: string;
  icon?: string | null;
}

export default function ProjectTile({ title, description, icon }: ProjectTileProps) {
  return (
    <div className="project-tile">
      {icon ? (
        <img src={icon} alt={`${title} icon`} className="tile-icon" />
      ) : (
        <div className="tile-placeholder-icon"></div>
      )}
      <h2 className="tile-title">{title}</h2>
      <p className="tile-desc">{description}</p>
    </div>
  );
}