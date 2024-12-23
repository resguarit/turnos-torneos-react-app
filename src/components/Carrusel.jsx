import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Imagen1 from '../assets/rng1.png'
import Imagen2 from '../assets/rng2.png'
import Imagen3 from '../assets/rng3.png'
import Imagen4 from '../assets/rng4.png'

const images = [
  Imagen1,
  Imagen2,
  Imagen3,
  Imagen4,
]

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slidesToShow, setSlidesToShow] = useState(4)
  const totalSlides = images.length

  useEffect(() => {
    const timer = setInterval(() => {
      goToNext()
    }, 5000)

    // Ajustar la cantidad de imágenes a mostrar según el tamaño de la pantalla
    const updateSlidesToShow = () => {
      if (window.innerWidth >= 768) { // Pantalla medianamente grande (md)
        setSlidesToShow(3)
      } else {
        setSlidesToShow(1) // Pantallas pequeñas (sm)
      }
    }

    window.addEventListener('resize', updateSlidesToShow)
    updateSlidesToShow() // Llamar la función para definir el número inicial de imágenes a mostrar

    return () => {
      clearInterval(timer)
      window.removeEventListener('resize', updateSlidesToShow)
    }
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? totalSlides - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides)
  }

  const getVisibleSlides = () => {
    let slides = []
    for (let i = 0; i < slidesToShow; i++) {
      slides.push((currentIndex + i) % totalSlides)
    }
    return slides
  }

  return (
    <div className="relative w-full mx-auto z-0">
      <div className="relative h-60 overflow-hidden rounded-lg">
        <div className="absolute w-full h-full flex transition-transform duration-500 ease-out justify-center">
          {getVisibleSlides().map((index) => (
            <div key={index} className="relative flex-shrink-0 w-full sm:w-1/3 aspect-square">
              <img
                src={images[index]}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              getVisibleSlides().includes(index) ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
