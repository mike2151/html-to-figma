const HowItWorks = () => {
    return (
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="step-number">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Copy Your HTML</h3>
              <p className="text-gray-600">Select and copy the HTML elements you want to convert to Figma.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="step-number">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Paste Into Tool</h3>
              <p className="text-gray-600">Open the HTML to Figma plugin and paste your HTML code.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="step-number">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Figma Components</h3>
              <p className="text-gray-600">Instantly receive perfectly converted Figma components with all styles intact.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }
  
  export default HowItWorks