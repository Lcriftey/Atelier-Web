import Header from './components/Header/Header';
import ClassesSection from './components/ClassesSection/ClassesSection';
import Hero from './components/Hero/Hero';
import ProductCarousel from './components/ProductCarousel/ProductCarousel';
import featuredProducts from './data/featuredProducts';

function App() {
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
        <ClassesSection />
      </main>
    </div>
  );
}

export default App;
