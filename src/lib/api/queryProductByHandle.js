import { gql } from "@apollo/client";

export default gql`
	query product($handle: String!) {
		productByHandle(handle: $handle) {
			id
			handle
			availableForSale
			title
			productType
			vendor
			tags
			description
			descriptionHtml
			tags
			options {
				id
				name
				values
			}
			priceRange {
				maxVariantPrice {
					amount
					currencyCode
				}
				minVariantPrice {
					amount
					currencyCode
				}
			}
			variants(first: 100) {
				pageInfo {
					hasNextPage
					hasPreviousPage
				}
				edges {
					node {
						id
						title
						sku
						availableForSale
						quantityAvailable
						requiresShipping
						selectedOptions {
							name
							value
						}
						priceV2 {
							amount
							currencyCode
						}
						compareAtPriceV2 {
							amount
							currencyCode
						}
					}
				}
			}
			images(first: 25) {
				pageInfo {
					hasNextPage
					hasPreviousPage
				}
				edges {
					node {
						originalSrc
						altText
						width
						height
					}
				}
			}
		}
	}
`;