import { LayoutIcon, OpenSourceIcon, LightningIcon } from './Icons'

const Features = () => {
  return (
    <section id="features" className="py-16 bg-white">
      <div className="container">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="feature-card">
            <div className="feature-icon">
              <LayoutIcon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Accurate Conversion</h3>
            <p className="text-gray-600">
              Preserves CSS styles, layout, and element hierarchy when converting from HTML to Figma.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <OpenSourceIcon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Open Source</h3>
            <p className="text-gray-600">
              Free to use and modify. Contribute to the project and help improve the tool for everyone.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <LightningIcon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">
              Convert complex HTML structures to Figma components in seconds, saving hours of manual work.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features