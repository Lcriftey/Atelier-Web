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
import featuredProducts from './data/featuredProducts';

function App() {
  const [route, setRoute] = useState(window.location.hash || '#home');

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
        <ClassesSection isHero />
        <CustomOrdersSection />
        <ProductCarousel
          compactBottom
          label="Obras destacadas"
          products={featuredProducts}
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
