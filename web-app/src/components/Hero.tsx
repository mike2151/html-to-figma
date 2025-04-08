import { GitHubIcon } from './Icons'

const Hero = () => {
  return (
    <section className="py-16 text-center">
      <div className="container">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 max-w-4xl">
            Transform HTML to Figma with a Single Click
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl">
            An open-source tool that converts your HTML elements into Figma components, preserving styles, structure, and semantics.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <a
              href="https://github.com/your-username/html-to-figma"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button"
            >
              <GitHubIcon className="w-5 h-5 mr-2" />
              View on GitHub
            </a>
            <a
              href="https://www.figma.com/community/plugin/PLUGIN_ID_HERE"
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-button"
            >
              Use the Plugin
            </a>
          </div>

          <div className="relative rounded-xl shadow-2xl bg-white p-2 max-w-4xl w-full">
            <div className="absolute top-0 left-0 right-0 h-6 bg-gray-100 rounded-t-xl flex items-center px-2">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="pt-6 px-3 pb-3">
              {/* Replace with an actual screenshot of your app */}
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="block mt-2">Screenshot or illustration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero