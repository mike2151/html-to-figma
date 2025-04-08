import { GitHubIcon } from './Icons'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-4">
              {/* Logo placeholder */}
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                {/* Replace with your actual logo */}
                <span className="text-white font-bold">H2F</span>
              </div>
              <span className="text-xl font-bold">HTML to Figma</span>
            </div>
            <p className="text-gray-400 mt-2">Open source HTML to Figma converter</p>
          </div>
          <div className="flex space-x-8">
            <a
              href="https://github.com/your-username/html-to-figma"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <span className="sr-only">GitHub</span>
              <GitHubIcon className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer