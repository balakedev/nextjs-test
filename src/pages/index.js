import Head from "next/head";
import { useEffect, useState } from "react";
import QUERY_PRODUCT_BY_HANDLE from "../lib/api/queryProductByHandle";
import QUERY_PRODUCTS from "../lib/api/queryProducts";
import { useQuery } from "../pages/_app";

function generateVariantTitle(options) {
  return options.map(option => `${option.name}-${option.value}`).join('/');
}

export default function Home() {
  // const { data: allProducts } = useQuery(QUERY_PRODUCTS);
  // console.log('all products', allProducts);

  const { loading, error, data } = useQuery(QUERY_PRODUCT_BY_HANDLE, {
    variables: {
      handle: 'prep-halterneck-top-blue'
    }
  });
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentVariants, setCurrentVariants] = useState(null);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentSelectedOptions, setCurrentSelectedOptions] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // ideally, cart should be on the global level, provided here by React Context and persists on each refresh
  // it's included here just for test purpose.
  const [cartItems, setCartItems] = useState({});

  useEffect(function onInitialLoad() {
    if (loading || error) return;

    const currentProduct = data.productByHandle;
    console.log('[debug] product', currentProduct);

    const variants = currentProduct?.variants?.edges.map(edge => {
      return {
        ...edge.node,
        variantTitle: generateVariantTitle(edge.node.selectedOptions)
      }
    })
    setCurrentVariants(variants);
    console.log('[debug] variants', variants);

    // const firstAvailableVariant = variants.find(variant => variant.availableForSale);
    const currentVariant = variants[0];
    console.log('[debug] currentVariant', currentVariant);

    setCurrentVariant(currentVariant);
    setCurrentProduct(currentProduct);
    const selectedOptions = {};
    currentVariant.selectedOptions.map(o => {
      selectedOptions[o.name] = o.value;
    })
    setCurrentSelectedOptions(selectedOptions)
    console.log('[debug] currentSelectedOptions', selectedOptions);
  }, [loading, error, data])

  useEffect(function onDataChanges() {
    console.log('[debug] ----onDataChanges----');
    console.log('[debug] currentSelectedOptions', currentSelectedOptions);
    console.log('[debug] currentVariant', currentVariant);
    console.log('[debug] currentQuantity', currentQuantity);
    console.log('[debug] --------');
  }, [currentSelectedOptions, currentVariant, currentQuantity])

  useEffect(function onCartItemChanges() {
    console.log('[debug] ----onCartItemChanges----');
    console.log('[debug] cartItems', cartItems);
    console.log('[debug] --------');
  }, [cartItems])

  function handleSelectOption(option) {
    return (event) => {
      event && event.preventDefault();
      const selectedOptionName = option.name;
      const selectedOptionValue = event.target.value;
      if (selectedOptionName && selectedOptionValue) {
        const newSelectedOptions = {
          ...currentSelectedOptions,
          [selectedOptionName]: selectedOptionValue
        }
        setCurrentSelectedOptions(newSelectedOptions);
        console.log('[debug] newSelectedOptions', newSelectedOptions)
        const newVariantTitle = Object.keys(newSelectedOptions).map(optionName => {
          return `${optionName}-${newSelectedOptions[optionName]}`
        }).join('/');
        console.log('[debug] newVariantTitle', newVariantTitle)
        const newVariant = currentVariants.find(v => v.variantTitle === newVariantTitle);
        setCurrentVariant(newVariant);
      }
    }
  }

  function handleQuantityInput(event) {
    event && event.preventDefault();
    const quantity = event.target.value;

    if (!quantity || quantity < 0) {
      setCurrentQuantity(1);
    }

    setCurrentQuantity(parseInt(quantity));
  }

  function handleAddToCart(event) {
    event.preventDefault();

    if (!currentVariant) return;

    setIsAddingToCart(true);

    console.log('[debug] before adding to cart', currentVariant);

    // simulate a call to the Shopify server to verify if this item can be added to cart
    setTimeout(() => {
      let currentVariantId = currentVariant.id;
      let updatedItem = cartItems[currentVariantId];

      if (updatedItem) {
        updatedItem.quantity = parseInt(updatedItem.quantity) + parseInt(currentQuantity);
      } else {
        updatedItem = {
          productName: currentProduct.title,
          sku: currentVariant.sku,
          variantTitle: currentVariant.variantTitle,
          quantity: parseInt(currentQuantity),
          priceV2: currentVariant.priceV2,
          compareAtPriceV2: currentVariant.compareAtPriceV2
        };
      }

      setCartItems({
        ...cartItems,
        [currentVariantId]: updatedItem
      })

      setIsAddingToCart(false);
    }, 2000)
  }

  if (loading || !currentProduct || !currentVariant) {
    return "Loading..."
  }

  if (error) {
    return "Error loading product"
  }

  return (
    <div className="">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="flex items-center justify-center w-full h-24 border-b">
        header
      </header>

      <main className="">
        <section className="w-full py-8">
          <div className="max-w-6xl mx-auto px-0 lg:px-4">
            <div className="flex flex-wrap flex-row">

              <div className="w-full lg:w-2/5">
                <div className="w-full h-full px-4 lg:px-0 bg-gray-100">
                  {/* Product Image Slider */}
                </div>
              </div>

              <div className="w-full lg:w-3/5 lg:pl-8 relative">
                <div className="product-details max-w-md mx-auto mt-4 lg:mt-0 bg-gray-100 lg:bg-transparent px-4 xs:px-8 pt-4 pb-8 lg:px-0 lg:py-0"
                  data-section-id="{{ section.id }}" data-section-type="product-template"
                  data-variant-id="{{ current_variant.id }}" itemScope itemType="http://schema.org/Product">
                  <meta itemProp="name" content="" />
                  <meta itemProp="url" content="" />
                  <meta itemProp="image" content="" />

                  <h2 className="mt-1 text-xl font-bold text-gray-700 leading-tight">{currentProduct.title}</h2>

                  <div data-variant-id="{{ current_variant.id }}" data-variant-sku className="">
                    <div className="mt-1 text-gray-500 text-xs inline-block mr-4">
                      SKU: <span>{currentVariant.sku}</span>
                    </div>
                  </div>

                  <div>
                    {currentProduct.options.map(option => {
                      return <label key={`option-${option.name}`} className="block mt-2 bg-gray-100 rounded-md relative">
                        <div className="text-xs uppercase tracking-wide text-gray-400 absolute top-3 left-3 z-10">{option.name}</div>
                        <select onChange={handleSelectOption(option)} className="bg-transparent pt-8 w-full pl-2 pb-3">
                          {option.values.map(value => {
                            return <option key={`option-${option.name}-${value}`}>{value}</option>
                          })}
                        </select>
                      </label>
                    })}
                  </div>

                  <div>
                    <label className="block w-48 mt-2 bg-gray-100 rounded-md relative">
                      <div className="text-xs uppercase tracking-wide text-gray-400 absolute top-3 left-3 z-10">Quantity</div>
                      <input onChange={handleQuantityInput}
                        defaultValue={currentQuantity}
                        className="bg-transparent pt-8 w-full pl-4 pb-3" type="number" min="1" />
                    </label>
                  </div>

                  <div className="pt-2"></div>

                  <div>
                    <button onClick={handleAddToCart} className="py-3 px-6 bg-blue-500 text-white rounded-lg w-full disabled:opacity-60 disabled:cursor-wait" disabled={isAddingToCart}>
                      {isAddingToCart ? '...' : <>Add to Cart</>}
                    </button>
                  </div>

                  <div className="pt-10 mb-8 border-b border-gray-200"></div>
                  {currentProduct.description}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 border-t">
        <h3 className="font-bold block text-center">Cart</h3>
        <div className="pt-2"></div>

        <div className="max-w-3xl mx-auto">

          {Object.keys(cartItems).map(id => {
            const item = cartItems[id];
            return <div key={id} className="bg-gray-100 p-2 mb-2">
              <div className="">
                <a className="block text-gray-800 hover:text-primary-500 text-sm lg:text-base"
                  href="#" title="View product">
                  {item.productName}
                </a>

                <div className="flex items-center">
                  <span className="text-xs lg:text-sm font-semibold mr-4 text-gray-500">
                    {item.sku}
                  </span>
                  <span className="text-xs lg:text-sm text-gray-500">
                    {item.variantTitle}
                  </span>
                </div>
              </div>

              <div className="w-full flex flex-row flex-no-wrap items-center">
                <div className="text-sm">
                  {(() => {
                    if (item.compareAtPriceV2.mount > item.priceV2.amount) {
                      return <>
                        <span className="sr-only">Discounted price</span>
                        <span>{item.priceV2.amount}</span>
                        <span className="sr-only">Original price</span>
                        <span className="line-through text-xs text-gray-400">{item.compareAtPriceV2.amount}</span></>
                    } else {
                      return <><span className="sr-only">Price</span>
                        <span>{item.priceV2.amount}</span>
                      </>
                    }
                  })()}
                </div>
                <div className="mx-2 text-sm">
                  &#10005;
                </div>
                <div className="">
                  <input type="number" name="updates[]" id="updates_{{ item.key }}"
                    className="text-sm py-2 w-12 text-center bg-gray-200 shadow-inner rounded-md"
                    value={item.quantity} onChange={() => {}} min="0" aria-label="Item quantity"/>
                </div>
                <div className="flex-1 w-full md:w-1/3 text-base lg:text-lg font-semibold text-right">
                  {item.price}
                </div>
              </div>
            </div>
          })}
        </div>
      </footer>
    </div>
  );
}
