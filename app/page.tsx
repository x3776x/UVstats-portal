import { title } from "process";
import ProjectTile from "../components/ProjectTile";
import Link from "next/link";

export default function Home() {
  const projects = [
    { id: 1, title: "ANOVA", description: "analisis de varianza", icon: "/icons/ANOVAppPortada.png", href: "/anova" },
    { id: 2, title: "EstDesc", description: "estadistica descriptiva", icon: "/icons/EstDescPortada.png", href: "/estDesc" },
    { id: 3, title: "Inferencia Est.", description: "Inferencia estadistica", icon: "/icons/InfEstPortada.png", href: "/infEst" },
    { id: 4, title: "Eficiencia Relat.", description: "Eficiencia relativa", icon: "/icons/EffRelatPortada.png", href: "/effRelat"},
    { id: 5, title: "Muest. Estad.", description: "Muestreo Estadístivo", icon: "/icons/MuestEstadPortada.png", href: "/muestEstad"},
    { id: 6, title: "Estratificación", description: "Estratificación de poblaciones", icon: "/icons/EstratificacionPortada.png", href: "/estratificacion"},
    { id: 7, title: "Tip. Prod.", description: "Tipología de productores", icon: "/icons/TipProdPortada.svg", href:"/tipProd"},
    { id: 8, title: "GE Gas.", description: "GE Gasolinas", icon: null, href:"/geGasolinas"},
    { id: 9, title: "SIMULARED.", description: "Simulared", icon: null, href:"/simulared"},
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <h1> Proyectos de estadistica disponibles </h1>
        <p> Bienvenido a la lista de proyectos de estadística disponibles. </p>
      </header>

      <main className="tile-grid">
        {projects.map((project) => (
          project.href ? (
            <Link href={project.href} key={project.id} className="block no-underline hover:scale-105 transition-transform">
              <ProjectTile 
                title={project.title}
                description={project.description}
                icon={project.icon}
              />
            </Link>
          ) : (
            <div key={project.id} className="opacity-60 cursor-not-allowed">
              <ProjectTile
                title={project.title}
                description={project.description}
                icon={project.icon}
              />
            </div>
          )
        ))}
      </main>
    </div>
  );
}
//Made on earth by humans