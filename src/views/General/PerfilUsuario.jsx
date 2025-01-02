import { Header } from '@/components/header'
import { Footer } from '@/components/footer'


function PerfilUsuario(){
  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold">Perfil Usuario</h1>
            <input></input>
            </div>
            </div>
      </main>
      <Footer />
    </div>
  )
}
export default PerfilUsuario;

