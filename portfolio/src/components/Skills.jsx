function Skills({ skillCategories }) {
  const defaultCategories = [
    {
      category: "Machine Learning & Deep Learning",
      icon: "🧠",
      skills: [
        { name: "Python", level: "Advanced" },
        { name: "Scikit-Learn", level: "Advanced" },
        { name: "PyTorch / TensorFlow", level: "Intermediate" },
        { name: "Neural Networks (CNN/RNN)", level: "Intermediate" },
        { name: "NLP & LLM APIs", level: "Intermediate" },
      ],
    },
    {
      category: "Data Science & Analysis",
      icon: "📊",
      skills: [
        { name: "Pandas & NumPy", level: "Advanced" },
        { name: "Data Preprocessing & Cleaning", level: "Advanced" },
        { name: "Exploratory Data Analysis (EDA)", level: "Advanced" },
        { name: "Matplotlib & Seaborn", level: "Advanced" },
        { name: "Model Evaluation & Metrics", level: "Advanced" },
      ],
    },
    {
      category: "ML Deployment & Full-Stack",
      icon: "⚡",
      skills: [
        { name: "FastAPI / Flask", level: "Intermediate" },
        { name: "Node.js & Express API", level: "Advanced" },
        { name: "React.js UI", level: "Advanced" },
        { name: "MongoDB / NoSQL", level: "Advanced" },
        { name: "Model Serving & Integration", level: "Intermediate" },
      ],
    },
    {
      category: "Tools & Environments",
      icon: "🛠️",
      skills: [
        { name: "Jupyter Notebooks / Colab", level: "Advanced" },
        { name: "Git & GitHub", level: "Advanced" },
        { name: "Docker (Containerization)", level: "Intermediate" },
        { name: "VS Code & Thunder Client", level: "Advanced" },
      ],
    },
  ];

  const categoriesToRender = skillCategories || defaultCategories;

  return (
    <div className="skills-section">
      <div className="section-header">
        <span className="section-tag">Core Capabilities</span>
        <h2>Machine Learning &amp; Technical Skills</h2>
        <p className="section-desc">Specialized in developing intelligent ML models, data-driven pipelines, and integrating them into full-stack web architectures.</p>
      </div>

      <div className="skills-grid">
        {categoriesToRender.map((cat, idx) => (
          <div key={idx} className="skill-category-card">
            <div className="skill-category-header">
              <span className="skill-category-icon">{cat.icon}</span>
              <h3>{cat.category}</h3>
            </div>
            <div className="skill-chips">
              {cat.skills.map((skill, sIdx) => (
                <div key={sIdx} className="skill-pill">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-level">{skill.level}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skills;