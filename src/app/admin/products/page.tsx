import { listAllProductsAdmin } from "@/services/admin/shop-admin.service";
import { NewProductForm, ProductStripeIdForm, ProductActiveToggle } from "@/components/admin/product-forms";

export default async function AdminProductsPage() {
  const products = await listAllProductsAdmin();

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-medium text-ink">Products</h1>

      <div className="mb-8 rounded-tag border border-dashed border-line bg-white/30 p-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/50">
          Add a new physical tag product
        </p>
        <NewProductForm />
      </div>

      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <div key={product.id} className="rounded-tag border border-line bg-white/50 p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-display text-lg text-ink">{product.name}</p>
                <p className="text-sm text-ink/60">
                  ₹{product.priceInr.toString()} <span className="text-ink/40">(${product.priceUsd.toString()} intl.)</span>
                </p>
              </div>
              <ProductActiveToggle productId={product.id} isActive={product.isActive} />
            </div>
            <ProductStripeIdForm productId={product.id} stripePriceId={product.stripePriceId} />
            <p className="mt-2 text-xs text-ink/40">
              Razorpay uses the INR price directly (no separate price ID needed) via their Orders
              API.
            </p>
          </div>
        ))}
        {products.length === 0 && <p className="text-sm text-ink/50">No products yet.</p>}
      </div>
    </div>
  );
}
