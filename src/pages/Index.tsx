import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
          
          {/* Hero Section */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Ready to Build
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              Your blank canvas awaits. Start creating something amazing with modern tools and beautiful design.
            </p>
          </div>

          {/* Action Section */}
          <div className="space-y-4 animate-slide-up">
            <Button size="lg" className="shadow-glow hover:shadow-elegant transition-all duration-300">
              Get Started
            </Button>
            <p className="text-sm text-muted-foreground">
              Built with React, TypeScript, and Tailwind CSS
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl animate-slide-up">
            <Card className="p-6 text-center hover:shadow-elegant transition-all duration-300 border-border/50">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Fast Development</h3>
              <p className="text-sm text-muted-foreground">Modern tooling for rapid development</p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-elegant transition-all duration-300 border-border/50">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold">🎨</span>
              </div>
              <h3 className="font-semibold mb-2">Beautiful Design</h3>
              <p className="text-sm text-muted-foreground">Carefully crafted components and styles</p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-elegant transition-all duration-300 border-border/50">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold">🚀</span>
              </div>
              <h3 className="font-semibold mb-2">Production Ready</h3>
              <p className="text-sm text-muted-foreground">Optimized and ready to deploy</p>
            </Card>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Index;
