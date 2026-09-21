import { useEffect, useState } from 'react';
import Header from './components/Header/Header';
import CatalogView from './components/Catalog/CatalogView';
import ClassesSection from './components/ClassesSection/ClassesSection';
import ArtworkDetail from './components/ArtworkDetail/ArtworkDetail';
import ArtistView from './components/Artist/ArtistView';
import GalleryView from './components/Gallery/GalleryView';
import Hero from './components/Hero/Hero';
import ProductCarousel from './components/ProductCarousel/ProductCarousel';
import CustomOrdersSection from './components/CustomOrdersSection/CustomOrdersSection';
import Footer from './components/Footer/Footer';
import CustomOrders from './pages/CustomOrders';
import featuredProducts from './data/featuredProducts';

function App() {
  const [route, setRoute] = useState(window.location.hash || '#home');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#home');
      if (window.location.hash === '#class-request-form') {
        window.setTimeout(() => {
          document.getElementById('class-request-form')?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
      } else {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const detailId = route.startsWith('#obra/') ? route.replace('#obra/', '') : null;
  const detailProduct = featuredProducts.find((product) => product.id === detailId);

  if (route === '#catalog') {
    return (
      <div className="site-shell">
        <Header />
        <CatalogView products={featuredProducts} />
        <Footer />
      </div>
    );
  }

  if (route === '#gallery') {
    return (
      <div className="site-shell">
        <Header />
        <GalleryView products={featuredProducts} />
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

  if (route === '#custom-orders') {
    return (
      <div className="site-shell">
        <Header />
        <CustomOrders />
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
        <ArtworkDetail product={detailProduct} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="site-shell">
      <Header />
      <main>
        <Hero />
        <ProductCarousel
          label="Obras destacadas"
          products={featuredProducts}
          title="Obras destacadas"
        />
        <CustomOrdersSection />
        <ClassesSection showForm={false} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
