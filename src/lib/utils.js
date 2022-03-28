/***************** API Setup ***************************************/

function storefrontQuery({ query, variables = {} }) {
    return axios.post('/api/2021-07/graphql.json',
        {
            query,
            variables
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': '*',
                "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN
            }
        })
}

/**
 * 
 * @param string productId 
 * @returns Promise
 */
export function getProductById({ productId }) {
    var getSpecificProductQuery = `query SpecificProduct($id: ID!) {
        node(id: $id) {
            id
            ... on Product {
                title
                description
                id
                handle
                variants(first: 20) {
                    edges {
                        node {
                            id
                            title
                            sku
                        }
                    }
                }
            }
        }
    }`

    return storefrontQuery({
        query: getSpecificProductQuery,
        variables: {
            id: window.btoa(`gid://shopify/Product/${productId}`)
        }
    })
}

