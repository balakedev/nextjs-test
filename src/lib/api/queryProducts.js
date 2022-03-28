import { gql } from "@apollo/client";

export default gql`query products {
    products(first: 50) {
        edges {
            cursor
            node {
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
        }
    }
}`