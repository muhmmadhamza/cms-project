const _ = require('lodash')
const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  return graphql(`
    {
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
  `).then((result) => {
    if (result.errors) {
      result.errors.forEach((e) => console.error(e.toString()))
      return Promise.reject(result.errors)
    }

    const mdFiles = result.data.allMarkdownRemark.edges

    const contentTypes = _.groupBy(mdFiles, 'node.fields.contentType')

    _.each(contentTypes, (pages, contentType) => {
      const pagesToCreate = pages.filter((page) =>
        // get pages with template field
        _.get(page, `node.frontmatter.template`)
      )
      if (!pagesToCreate.length) return console.log(`Skipping ${contentType}`)

      console.log(`Creating ${pagesToCreate.length} ${contentType}`)

      pagesToCreate.forEach((page, index) => {
        const id = page.node.id
        createPage({
          // page slug set in md frontmatter
          path: page.node.fields.slug,
          component: path.resolve(
            `src/templates/${String(page.node.frontmatter.template)}/index.js`
          ),
          // additional data can be passed via context
          context: {
            id
          }
        })
      })
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  // convert frontmatter images

  // Create smart slugs
  // https://github.com/Vagr9K/gatsby-advanced-starter/blob/master/gatsby-node.js
  let slug
  if (node.internal.type === 'MarkdownRemark') {
    const fileNode = getNode(node.parent)
    const parsedFilePath = path.parse(fileNode.relativePath)

    if (_.get(node, 'frontmatter.slug')) {
      slug = `/${node.frontmatter.slug.toLowerCase()}/`
    } else if (
      // home page gets root slug
      parsedFilePath.name === 'home' &&
      parsedFilePath.dir === 'pages'
    ) {
      slug = `/`
    } else if (_.get(node, 'frontmatter.postslug')) {
      slug = `/${_.kebabCase(parsedFilePath.dir)}/${_.kebabCase(
        node.frontmatter.postslug
      )}/`
    } else if (parsedFilePath.dir === '') {
      slug = `/${parsedFilePath.name}/`
    } else {
      slug = `/${parsedFilePath.dir}/`
    }

    createNodeField({
      node,
      name: 'slug',
      value: slug
    })

    // Add contentType to node.fields
    createNodeField({
      node,
      name: 'contentType',
      value: parsedFilePath.dir
    })
  }
}

exports.onCreateWebpackConfig = ({ getConfig, actions }) => {
  const devtool = getConfig().mode === 'production' ? false : 'eval-source-map'
  actions.setWebpackConfig({
    devtool,
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules']
    }
  })
}

// exports.onCreateWebpackConfig = ({ stage, loaders, actions, plugins }) => {
//   if (stage === 'build-html' || stage === 'develop-html') {
//     actions.setWebpackConfig({
//       module: {
//         rules: [
//           {
//             test: /bad-module/,
//             use: loaders.null()
//           }
//         ]
//       },
//       plugins: [
//         plugins.define({
//           'global.GENTLY': false
//         })
//       ]
//     })
//   }
// }

exports.createSchemaCustomization = ({ actions, schema }) => {
  const { createTypes } = actions
  const typeDefs = [
    'type MarkdownRemark implements Node { frontmatter: Frontmatter }',
    schema.buildObjectType({
      name: 'Frontmatter',
      fields: {
        tags: {
          type: '[String!]',
          resolve(source, args, context, info) {
            const { tags } = source
            if (source.tags == null || (Array.isArray(tags) && !tags.length)) {
              return []
            }
            return tags
          }
        }
      }
    })
  ]
  createTypes(typeDefs)
}

// Random fix for https://github.com/gatsbyjs/gatsby/issues/5700
module.exports.resolvableExtensions = () => ['.json']
