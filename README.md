# Imaginovation Gatsby + netlifyCMS starter

# GraphQL Queries
You can execute these queries in GraphiQL interface (http://localhost:8000/___graphql)
# For All Collections
query AllCollections {
allMarkdownRemark(limit: 1000) {
    edges {
      node {
        id
        frontmatter {
          template
          title
          postslug
        }
        fields {
          slug
          contentType
        }
      }
    }
  }
}

