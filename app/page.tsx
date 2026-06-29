import ProjectTile from "../components/ProjectTile";
import Link from "next/link";

export default function Home() {
  const projects = [
    { id: 1, title: "ANOVA", description: "analisis de varianza", icon: "/icons/ANOVAppPortada.png", href: "/anova" },
    { id: 2, title: "EstDesc", description: "estadistica descriptiva", icon: "/icons/EstDescPortada.png", href: "/estDesc" },
    { id: 3, title: "Inferencia Est.", description: "Inferencia estadistica", icon: "/icons/InfEstPortada.png", href: "/infEst" },
    { id: 4, title: "next example", description: "descripcion...", icon: null, href: null},
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