import { useEffect, useState } from 'react';
import Header from './components/Header/Header';
import CatalogView from './components/Catalog/CatalogView';
import ClassesSection from './components/ClassesSection/ClassesSection';
import ArtworkDetail from './components/ArtworkDetail/ArtworkDetail';
import ArtistView from './components/Artist/ArtistView';
import ProductCarousel from './components/ProductCarousel/ProductCarousel';
import CustomOrdersSection from './components/CustomOrdersSection/CustomOrdersSection';
import Footer from './components/Footer/Footer';
import CustomOrders from './pages/CustomOrders';
import AdminObras from './pages/AdminObras';
import featuredProducts from './data/featuredProducts';
import obrasApi from './api/obrasApi';
import imagenesObraApi from './api/imagenesObraApi';

function toCatalogProduct(obra, imagenes) {
  const obraImages = imagenes
    .filter((imagen) => imagen.obraId === obra.id)
    .sort((first, second) => first.ordenVisualizacion - second.ordenVisualizacion);
  const principal = obraImages.find((imagen) => imagen.esPrincipal) || obraImages[0];
  const imageUrls = obraImages.map((imagen) => imagen.urlImagen);
  const price = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: obra.moneda,
    maximumFractionDigits: 0,
  }).format(obra.precio);

  return {
    id: obra.id,
    nombre: obra.nombre,
    name: obra.nombre,
    image: principal?.urlImagen,
    images: imageUrls,
    alt: principal?.textoAlternativo || obra.nombre,
    price: `${price} ${obra.moneda}`,
    precio: obra.precio,
    availability: obra.estado === 'DISPONIBLE' ? 'Disponible' : 'No disponible',
    technique: obra.descripcionTecnica,
    dimensions: obra.dimensiones,
    artisticDescription: obra.descripcionArtistica,
    technicalDescription: obra.descripcionTecnica,
    description: obra.descripcionArtistica,
    published: obra.fechaPublicacion,
    href: `#obra/${obra.id}`,
  };
}

function App() {
  const [route, setRoute] = useState(window.location.hash || '#home');
  const [catalogProducts, setCatalogProducts] = useState(featuredProducts);

  useEffect(() => {
    Promise.all([obrasApi.getAll(), imagenesObraApi.getAll()])
      .then(([obras, imagenes]) => {
        const products = obras
          .map((obra) => toCatalogProduct(obra, imagenes))
          .filter((product) => product.image);
        setCatalogProducts(products);
      })
      .catch(() => {
        // Conserva el catálogo de muestra si la API no está disponible.
      });
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const nextHash = window.location.hash || '#home';
      setRoute(nextHash);
      if (!['#class-request-form', '#custom-order-form'].includes(nextHash)) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!['#class-request-form', '#custom-order-form'].includes(route)) {
      return undefined;
    }

    const targetId = route.slice(1);
    const scrollTimer = window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }, 0);

    return () => window.clearTimeout(scrollTimer);
  }, [route]);

  const detailId = route.startsWith('#obra/') ? route.replace('#obra/', '') : null;
  const detailProduct = catalogProducts.find((product) => product.id === detailId);

  if (route === '#admin-obras') {
    return <AdminObras />;
  }

  if (route === '#catalog') {
    return (
      <div className="site-shell">
        <Header />
        <CatalogView products={catalogProducts} />
        <Footer />
      </div>
    );
  }

  if (route === '#about') {
    return (
      <div className="site-shell">
        <Header />
        <ArtistView />
        <Footer />
      </div>
    );
  }

  if (route === '#custom-orders' || route === '#custom-order-form') {
    return (
      <div className="site-shell">
        <Header />
        <CustomOrders works={catalogProducts} />
        <Footer />
      </div>
    );
  }

  if (route === '#classes' || route === '#class-request-form') {
    return (
      <div className="site-shell">
        <Header />
        <ClassesSection />
        <Footer />
      </div>
    );
  }

  if (detailProduct) {
    return (
      <div className="site-shell">
        <Header />
        <ArtworkDetail
          otherProducts={catalogProducts.filter((product) => product.id !== detailProduct.id)}
          product={detailProduct}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="site-shell">
      <Header />
      <main>
        <ClassesSection isHero />
        <CustomOrdersSection />
        <ProductCarousel
          compactBottom
          label="Obras destacadas"
          products={catalogProducts}
          title="Obras destacadas"
        />
        <ClassesSection
          compactFaq
          showCta={false}
          showFaq
          showForm={false}
          showIntroduction={false}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;
