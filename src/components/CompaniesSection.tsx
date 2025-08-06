export const CompaniesSection = () => {
  const companies = [
    { name: 'Descript', logo: '🎙️' },
    { name: 'Expo', logo: '📱' },
    { name: 'Retool', logo: '🔧' },
    { name: 'Unsplash', logo: '📸' },
    { name: 'Linear', logo: '📋' },
    { name: 'Vercel', logo: '▲' },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-neon">
          <h2 className="text-center text-white/60 text-sm font-medium mb-8 uppercase tracking-wider">
            Growing companies using Vaporwave
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {companies.map((company) => (
              <div 
                key={company.name}
                className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-white/5 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {company.logo}
                </div>
                <span className="text-white/60 text-sm font-medium group-hover:text-white/80 transition-colors duration-300">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};