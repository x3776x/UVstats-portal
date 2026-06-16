import ProjectTile from "../components/ProjectTile";
import Link from "next/link";

export default function Home() {
  const projects = [
    { id: 1, title: "ANOVA", description: "analisis de varianza", icon: "/icons/ANOVAppPortada.png" },
    { id: 2, title: "Estadistica descriptiva", description: "descripcion...", icon: null },
    { id: 3, title: "Regresion Logistica", description: "descripcion...", icon: null },
    { id: 4, title: "next example", description: "descripcion...", icon: null},
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <h1> Proyectos de estadistica disponibles </h1>
        <p> Bienvenido a la lista de proyectos de estadística disponibles. </p>
      </header>

      <main className="tile-grid">
        {projects.map((project) => (
          project.title === "ANOVA" ? (
            <Link href="/anova" key={project.id} className="block no-underline">
              <ProjectTile 
                title={project.title} 
                description={project.description} 
                icon={project.icon} 
              />
            </Link>
          ) : (
            <ProjectTile 
              key={project.id} 
              title={project.title} 
              description={project.description} 
              icon={project.icon} 
            />
          )
        ))}
      </main>
    </div>
  );
}