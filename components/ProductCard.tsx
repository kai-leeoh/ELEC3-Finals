import { formatPrice } from "../lib/format";
import type { Product } from "../lib/types";

export default function ProductCard({ products }: { products: Product[] }) {
  return (
    <div className="card service-card">
      <ul className="service-list">
        {products.map((p) => (
          <li key={p.id} className="service">
            <div className="service-title">
              <span>{p.name}</span>
              <span className="service-leader" aria-hidden="true" />
              <span className="service-price">{formatPrice(p.price)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
