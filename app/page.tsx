"use client"
import React from 'react';
import { useRouter } from "next/navigation";

import { Upload, Shield, Brain, Download, Zap, CheckCircle, Users, Building2, ArrowRight, Sparkles, BarChart3, FileCheck, Menu, X } from 'lucide-react';
import UploadPage from './Upload/page';

function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const router = useRouter();
  const handleClick = () => {
    // You can run logic here before navigation
    router.push("/Upload");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Data Alchemist</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-blue-100 hover:text-white transition-colors duration-200">Features</a>
              <a href="#how-it-works" className="text-blue-100 hover:text-white transition-colors duration-200">How It Works</a>
              <a href="#benefits" className="text-blue-100 hover:text-white transition-colors duration-200">Benefits</a>
              <a href="#demo" className="text-blue-100 hover:text-white transition-colors duration-200">Demo</a>
              <a href="#testimonials" className="text-blue-100 hover:text-white transition-colors duration-200">Testimonials</a>
            </div>
            
            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <button className="text-blue-100 hover:text-white transition-colors duration-200">
                Sign In
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5"
                 onClick={handleClick}>
                Get Started
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-yellow-400 transition-colors duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-black/40 backdrop-blur-md rounded-lg mt-2 border border-white/10">
                <a href="#features" className="block px-3 py-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200">Features</a>
                <a href="#how-it-works" className="block px-3 py-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200">How It Works</a>
                <a href="#benefits" className="block px-3 py-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200">Benefits</a>
                <a href="#demo" className="block px-3 py-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200">Demo</a>
                <a href="#testimonials" className="block px-3 py-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200">Testimonials</a>
                <div className="border-t border-white/10 pt-3 mt-3">
                  <button className="block w-full text-left px-3 py-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200">
                    Sign In
                  </button>
                  <button className="block w-full mt-2 px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-semibold rounded-lg transition-all duration-300"
                      onClick={handleClick}>
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-16">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Powered by AI • Built by Digitalyz</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
              Turn Your Raw Data Into Gold
            </h1>
            
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed">
              AI-powered data cleaning, validation, and business rule automation for modern teams who demand precision.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <span className="flex items-center gap-2"
               onClick={handleClick}>
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Perfect Your Data
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Comprehensive tools that transform messy spreadsheets into business-ready assets
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: "Smart File Upload",
                description: "Upload CSV/XLSX files with instant in-grid editing capabilities and real-time preview"
              },
              {
                icon: Shield,
                title: "Intelligent Validation",
                description: "Advanced data validation for clients, workers, and tasks with customizable rules"
              },
              {
                icon: Brain,
                title: "Natural Language Rules",
                description: "Create complex business rules through intuitive UI or simple natural language commands"
              },
              {
                icon: Sparkles,
                title: "AI Suggestions",
                description: "Get intelligent rule recommendations and automatic data correction suggestions"
              },
              {
                icon: Download,
                title: "Clean Export",
                description: "Export perfectly cleaned data with accompanying rules.json configuration file"
              },
              {
                icon: BarChart3,
                title: "Business Intelligence",
                description: "Transform raw data into actionable insights with built-in analytics and reporting"
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="h-full p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-blue-100 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              From Chaos to Clarity in 4 Steps
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Our streamlined process makes data transformation effortless and efficient
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Upload Your Data",
                description: "Drag and drop your CSV or XLSX files into our secure platform"
              },
              {
                step: "02", 
                title: "Clean & Validate",
                description: "AI analyzes your data and suggests cleaning operations and validations"
              },
              {
                step: "03",
                title: "Apply Business Rules", 
                description: "Define custom rules through our UI or natural language interface"
              },
              {
                step: "04",
                title: "Export Results",
                description: "Download your cleaned data with full documentation and rule files"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto shadow-xl">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-blue-100 leading-relaxed">{step.description}</p>
                </div>
                
                {index < 3 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-purple-500 to-blue-600 opacity-30 z-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              The Power of AI-Driven Data Processing
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Leverage cutting-edge artificial intelligence to transform your data workflows
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Save Time",
                description: "Automated rule creation reduces manual work by 90%, letting you focus on insights rather than cleanup",
                stat: "90% faster"
              },
              {
                icon: CheckCircle,
                title: "Reduce Errors", 
                description: "Intelligent validation catches inconsistencies and data quality issues before they impact your business",
                stat: "99.9% accuracy"
              },
              {
                icon: Brain,
                title: "Better Decisions",
                description: "Clean, structured data enables confident decision-making with reliable, actionable insights",
                stat: "3x better insights"
              }
            ].map((benefit, index) => (
              <div key={index} className="relative group">
                <div className="h-full p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-yellow-400/50 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      {benefit.stat}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-white mb-4">{benefit.title}</h3>
                  <p className="text-blue-100 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              See Data Alchemist in Action
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Experience the intuitive interface and powerful features that make data transformation effortless
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Dashboard Overview",
                description: "Clean, intuitive interface showing all your data projects at a glance"
              },
              {
                title: "Rule Creation",
                description: "Build complex validation rules with our visual editor or natural language"
              },
              {
                title: "Live Validation",
                description: "Watch as AI validates and cleans your data in real-time"
              }
            ].map((demo, index) => (
              <div key={index} className="group">
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-white/20 flex items-center justify-center mb-4 group-hover:border-yellow-400/50 transition-all duration-300">
                  <div className="text-center">
                    <FileCheck className="w-16 h-16 text-white/50 mx-auto mb-4" />
                    <p className="text-white/70">Screenshot Placeholder</p>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{demo.title}</h3>
                <p className="text-blue-100">{demo.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Leading Organizations
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              See how Data Alchemist transforms workflows across industries
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Digital Agencies</h3>
                  <p className="text-blue-200">Workforce Management</p>
                </div>
              </div>
              <p className="text-blue-100 leading-relaxed mb-4">
                "Data Alchemist revolutionized our workforce scheduling process. What used to take hours of manual validation now happens in minutes, and our client data has never been cleaner."
              </p>
              <p className="text-yellow-400 font-medium">— Streamlined workforce scheduling for 50+ clients</p>
            </div>
            
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Consulting Firms</h3>
                  <p className="text-blue-200">Data Quality Assurance</p>
                </div>
              </div>
              <p className="text-blue-100 leading-relaxed mb-4">
                "The AI validation caught errors in our client data that we never would have found manually. Our reports are now 100% accurate, and client confidence has never been higher."
              </p>
              <p className="text-yellow-400 font-medium">— 99.9% data accuracy across all client projects</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Transform Your Data?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals who've already discovered the power of AI-driven data transformation
          </p>
          
          <button className="group px-12 py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300"
           onClick={handleClick}>
            <span className="flex items-center gap-3">
              Try Data Alchemist Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
          
          <p className="text-sm text-blue-200 mt-6">
            No credit card required • Start transforming data in minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <span className="text-2xl font-bold text-white">Data Alchemist</span>
          </div>
          <p className="text-blue-200 mb-6">by Digitalyz</p>
          <p className="text-sm text-blue-300">
            © 2025 Digitalyz. All rights reserved. Transform your data, transform your business.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;