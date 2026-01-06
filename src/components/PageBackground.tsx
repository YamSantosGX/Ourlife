import heroImage from "@/assets/hero-romantic.jpg";

interface PageBackgroundProps {
  children: React.ReactNode;
}

const PageBackground = ({ children }: PageBackgroundProps) => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed background image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 z-0 bg-background/85" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PageBackground;
