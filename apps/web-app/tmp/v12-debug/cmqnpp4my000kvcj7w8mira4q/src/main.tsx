import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type IconName = 'search' | 'user' | 'bag' | 'menu' | 'close' | 'leaf' | 'bottle' | 'seal' | 'chevron';

type Product = {
  title: string;
  price: string;
  oldPrice?: string;
  image: string;
  rating: number;
  badge?: string;
  action?: string;
};

const Icon = ({ name, size = 20 }: { name: IconName; size?: number }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.65,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  };

  const icons: Record<IconName, React.ReactNode> = {
    search: <><circle cx='11' cy='11' r='6.5' /><path d='m19.5 19.5-4-4' /></>,
    user: <><circle cx='12' cy='8' r='3.2' /><path d='M5.7 20c.5-3.8 2.6-5.7 6.3-5.7s5.8 1.9 6.3 5.7' /></>,
    bag: <><path d='M5.5 8.5h13l-1 11h-11l-1-11Z' /><path d='M9 9V6.7a3 3 0 0 1 6 0V9' /></>,
    menu: <path d='M4 7h16M4 12h16M4 17h16' />,
    close: <path d='m5 5 14 14M19 5 5 19' />,
    leaf: <><path d='M19.5 4.5C12 4.8 6.4 8.2 6.3 14.3c0 3 2.1 5.2 5 5.2 6.1-.1 8.1-7.6 8.2-15Z' /><path d='M5 20c2.2-4.1 5.2-7.1 9.6-9.2' /></>,
    bottle: <><path d='M10 3h4v4h-4zM9 7h6l2 4v9H7v-9l2-4Z' /><path d='M9 12h6' /></>,
    seal: <><path d='m12 3 2 1.3 2.4-.1.7 2.3L19 8l-.8 2.3.8 2.3-1.9 1.5-.7 2.4-2.4-.1-2 1.3-2-1.3-2.4.1-.7-2.4L5 12.6l.8-2.3L5 8l1.9-1.5.7-2.3 2.4.1L12 3Z' /><path d='m9 10.5 2 2 4-4' /></>,
    chevron: <path d='m8 10 4 4 4-4' />
  };

  return <svg aria-hidden='true' {...common}>{icons[name]}</svg>;
};

const newProducts: Product[] = [
  {
    title: 'Set of body care combo products',
    price: '$29.00 – $48.50',
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=88',
    rating: 5,
    action: 'View products'
  },
  {
    title: 'Rice body scrub with argan oil',
    price: '$35.00',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=88',
    rating: 5
  },
  {
    title: 'Hyaluronic skin booster',
    price: '$48.50',
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=88',
    rating: 4
  },
  {
    title: 'Shower & bath gel',
    price: '$29.00',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=88',
    rating: 4
  }
];

const saleProducts: Product[] = [
  {
    title: 'Vitamin C 3% serum',
    price: '$80.00',
    oldPrice: '$95.00',
    image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=88',
    rating: 5,
    badge: 'Sale'
  },
  {
    title: 'Gentle Foaming Face Wash',
    price: '$38.00',
    oldPrice: '$50.00',
    image: 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?auto=format&fit=crop&w=900&q=88',
    rating: 5,
    badge: 'Sale'
  },
  {
    title: 'Hydrating Night Moisturizer',
    price: '$28.00',
    oldPrice: '$40.00',
    image: 'https://images.unsplash.com/photo-1611930021592-a8cfd5319ceb?auto=format&fit=crop&w=900&q=88',
    rating: 2,
    badge: 'Sale'
  },
  {
    title: 'Salicylic Acid Toner',
    price: '$26.00',
    oldPrice: '$30.00',
    image: 'https://images.unsplash.com/photo-1624454002429-40ed87a5ec17?auto=format&fit=crop&w=900&q=88',
    rating: 5,
    badge: 'Sale'
  }
];

const blogPosts = [
  {
    title: '5 signs that skin lacks moisture',
    text: 'Increased sensitivity is one of the first signs that it’s time to add a more intensive moisturizing cream.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=86'
  },
  {
    title: 'Beauty from within: nutrition and skin health',
    text: 'Discover how vitamins, hydration, and balanced meals play a vital role in achieving a natural glow.',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1000&q=86'
  },
  {
    title: 'Nutrition and skin health',
    text: 'Discover how thoughtful daily rituals help support balanced, comfortable and naturally radiant skin.',
    image: 'https://images.unsplash.com/photo-1575410229391-19b4da01cc94?auto=format&fit=crop&w=1000&q=86'
  }
];

function ProductCard({ product, onAdd }: { product: Product; onAdd: (title: string) => void }) {
  return (
    <article className='product-card'>
      <div className='product-image-wrap'>
        {product.badge && <span className='badge'>{product.badge}</span>}
        <img className='product-image' src={product.image} alt={product.title} loading='lazy' />
        <button className='quick-add' onClick={() => onAdd(product.title)} aria-label={`Quick add ${product.title}`}>+</button>
      </div>
      <h3>{product.title}</h3>
      <div className='price-row'>
        <span className={product.oldPrice ? 'sale-price' : ''}>{product.price}</span>
        {product.oldPrice && <del>{product.oldPrice}</del>}
      </div>
      <div className='product-bottom'>
        <button className='pill dark' onClick={() => onAdd(product.title)}>{product.action || 'Add to cart'}</button>
        <span className='stars' aria-label={`${product.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map(star => <span className={star <= product.rating ? '' : 'muted'} key={star}>★</span>)}
        </span>
      </div>
    </article>
  );
}

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const newProductsRef = useRef<HTMLDivElement>(null);
  const saleProductsRef = useRef<HTMLDivElement>(null);
  const noticeTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const showNotice = (message: string) => {
    window.clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(''), 2600);
  };

  const addToCart = (title: string) => {
    setCartCount(value => value + 1);
    showNotice(`${title} added to your bag`);
  };

  const scrollProducts = (ref: React.RefObject<HTMLDivElement | null>, direction: number) => {
    ref.current?.scrollBy({ left: direction * 340, behavior: 'smooth' });
  };

  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get('email') || '');
    if (!email) {
      showNotice('Please enter your email address.');
      return;
    }
    showNotice('Welcome to Sunlit Meadows — your 10% offer is on its way!');
    form.reset();
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className='site-shell'>
      {notice && <div className='toast' role='status'>{notice}</div>}

      <header className='header'>
        <div className='nav-wrap'>
          <button
            className='menu-button'
            onClick={() => setMenuOpen(value => !value)}
            aria-label='Toggle navigation menu'
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={21} />
          </button>

          <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label='Main navigation'>
            <a href='#home' onClick={closeMenu}>Home <Icon name='chevron' size={12} /></a>
            <a href='#categories' onClick={closeMenu}>Category <Icon name='chevron' size={12} /></a>
            <a href='#sale' onClick={closeMenu}>Offer <Icon name='chevron' size={12} /></a>
            <a href='#journal' onClick={closeMenu}>Pages <Icon name='chevron' size={12} /></a>
            <a href='#products' onClick={closeMenu}>Shop <Icon name='chevron' size={12} /></a>
          </nav>

          <a className='logo' href='#home' aria-label='Sunlit Meadows home'><span>Sunlit</span> Meadows</a>

          <div className='header-actions'>
            <a className='contact-link' href='#footer'>Contact</a>
            <button aria-label='Search'><Icon name='search' size={17} /></button>
            <button aria-label='Account'><Icon name='user' size={17} /></button>
            <button className='bag-button' aria-label={`Shopping bag with ${cartCount} items`}>
              <Icon name='bag' size={17} />
              {cartCount > 0 && <span>{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className='hero' id='home'>
          <div className='hero-shade' />
          <div className='hero-content container'>
            <h1>View new beauty<br />arrivals of skincare</h1>
            <p>Discover the combination of science and luxury in every product. Our newest collection is designed to give skin radiance.</p>
            <a className='pill light-button' href='#products'>Shop Now</a>
          </div>
        </section>

        <section className='product-section' id='products'>
          <div className='container'>
            <div className='product-heading'>
              <span aria-hidden='true' />
              <h2>New Arrivals</h2>
              <div className='carousel-buttons'>
                <button onClick={() => scrollProducts(newProductsRef, -1)} aria-label='Previous new products'>‹</button>
                <button onClick={() => scrollProducts(newProductsRef, 1)} aria-label='Next new products'>›</button>
              </div>
            </div>
            <div className='product-grid' ref={newProductsRef}>
              {newProducts.map(product => <ProductCard key={product.title} product={product} onAdd={addToCart} />)}
            </div>
          </div>
        </section>

        <section className='categories' id='categories'>
          <div className='category-photo'>
            <img src='https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1400&q=90' alt='Woman holding a skincare serum' loading='lazy' />
          </div>
          <div className='category-content'>
            <p className='eyebrow'>Categories</p>
            <div className='category-intro'>
              <h2>Skin care</h2>
              <p>Daily essentials for clean, hydrated, and radiant skin.</p>
            </div>
            <a href='#products'>Body products</a>
            <a href='#sale'>Anti-aging care</a>
            <a href='#products'>Organic products</a>
            <a className='pill dark category-button' href='#products'>All Products</a>
          </div>
          <img className='category-detail' src='https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=85' alt='Skincare application detail' loading='lazy' />
        </section>

        <section className='about container' id='about'>
          <p className='eyebrow'>About us</p>
          <h2>We strive to help every woman reveal<br />her skin’s natural radiance by selecting<br />only the best from around the world.</h2>
          <div className='value-grid'>
            <article>
              <div className='value-icon'><Icon name='bottle' /></div>
              <h3>Pure ingredients</h3>
              <p>Only clean, safe, and carefully selected components to protect your skin and health.</p>
            </article>
            <article>
              <div className='value-icon'><Icon name='seal' /></div>
              <h3>Dermatologist approved</h3>
              <p>Every product is tested and recommended by experts for visible and lasting results.</p>
            </article>
            <article>
              <div className='value-icon'><Icon name='leaf' /></div>
              <h3>Sustainable beauty</h3>
              <p>Eco-friendly packaging and cruelty-free formulas for conscious self-care.</p>
            </article>
          </div>
        </section>

        <section className='bestseller'>
          <div className='bestseller-overlay' />
          <div className='bestseller-copy'>
            <h2>Bestsellers</h2>
            <p>See the combination of science and luxury in every product. Our collection is designed to give skin radiance.</p>
            <a className='pill light-button' href='#sale'>Shop now</a>
          </div>
          <button className='hotspot hot-one' onClick={() => addToCart('Botanical renewal serum')} aria-label='Add botanical renewal serum'>+</button>
          <button className='hotspot hot-two' onClick={() => addToCart('Restorative face oil')} aria-label='Add restorative face oil'>+</button>
          <button className='hotspot hot-three' onClick={() => addToCart('Daily barrier cream')} aria-label='Add daily barrier cream'>+</button>
        </section>

        <section className='product-section sale-section' id='sale'>
          <div className='container'>
            <div className='product-heading'>
              <span aria-hidden='true' />
              <h2>Sale</h2>
              <div className='carousel-buttons'>
                <button onClick={() => scrollProducts(saleProductsRef, -1)} aria-label='Previous sale products'>‹</button>
                <button onClick={() => scrollProducts(saleProductsRef, 1)} aria-label='Next sale products'>›</button>
              </div>
            </div>
            <div className='product-grid' ref={saleProductsRef}>
              {saleProducts.map(product => <ProductCard key={product.title} product={product} onAdd={addToCart} />)}
            </div>
          </div>
        </section>

        <section className='testimonial'>
          <div className='testimonial-copy'>
            <p className='eyebrow'>Testimonials</p>
            <div className='customer'>
              <img src='https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=85' alt='Ashley' loading='lazy' />
              <div><strong>Ashley</strong><span>★ 4.5</span></div>
            </div>
            <blockquote>“I’ve been using this cream for three weeks now, and the results are simply amazing. My skin has become more moisturized, supple, and radiant. The texture is light, absorbs quickly, and doesn’t leave a greasy shine.”</blockquote>
          </div>
          <div className='testimonial-photo'>
            <img src='https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1500&q=90' alt='Woman applying face cream' loading='lazy' />
            <div className='floating-product'>
              <img src='https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=85' alt='Snail smart serum' loading='lazy' />
              <strong>Snail smart serum</strong>
              <div><span>$72.00</span><span className='stars'>★★★★★</span></div>
            </div>
          </div>
        </section>

        <section className='blog container' id='journal'>
          <h2>Blog</h2>
          <div className='blog-grid'>
            {blogPosts.map(post => (
              <article key={post.title}>
                <a className='blog-image' href='#footer' aria-label={post.title}>
                  <img src={post.image} alt={post.title} loading='lazy' />
                </a>
                <h3>{post.title}</h3>
                <p>{post.text}</p>
                <a className='text-link' href='#footer'>Read more</a>
              </article>
            ))}
          </div>
        </section>

        <section className='subscribe-section'>
          <div className='subscribe-card'>
            <h2>Subscribe to get<br /><em>-10% off</em></h2>
            <p>Stay updated with new arrivals, beauty tips, and exclusive offers — plus enjoy 10% off your first order.</p>
            <form onSubmit={subscribe}>
              <input type='email' name='email' aria-label='Email address' placeholder='Email' required />
              <button className='pill dark' type='submit'>Subscribe</button>
            </form>
          </div>
        </section>
      </main>

      <footer id='footer'>
        <div className='footer-main container'>
          <div className='footer-brand'>
            <a className='footer-logo' href='#home'><span>Sunlit</span> Meadows</a>
            <p>We strive to help every woman reveal her skin’s natural radiance by selecting only the best from around the world.</p>
            <div className='socials'>
              <a href='#footer' aria-label='Instagram'>◎</a>
              <a href='#footer' aria-label='Facebook'>f</a>
              <a href='#footer' aria-label='TikTok'>♪</a>
            </div>
          </div>
          <div className='footer-links'>
            <div>
              <h3>Products</h3>
              <a href='#products'>Shop all</a>
              <a href='#products'>Skin care</a>
              <a href='#products'>Body products</a>
              <a href='#sale'>Anti-aging care</a>
              <a href='#products'>Organic products</a>
            </div>
            <div>
              <h3>Information</h3>
              <a href='#about'>About us</a>
              <a href='#journal'>Blog</a>
              <a href='#footer'>Contact</a>
            </div>
            <div>
              <h3>More</h3>
              <a href='#footer'>Privacy policy</a>
              <a href='#footer'>Terms of service</a>
              <a href='#footer'>Shipping & returns</a>
            </div>
          </div>
        </div>
        <div className='footer-bottom container'>
          <span>© All rights reserved. Made with care by Sunlit Meadows</span>
          <div className='payments' aria-label='Accepted payment methods'>
            <b>VISA</b><b className='mastercard'>●●</b><b><span className='google'>G</span> Pay</b><b> Pay</b>
          </div>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);