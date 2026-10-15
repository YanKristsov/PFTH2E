import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'

const TOKEN = process.env.GITHUB_TOKEN
if (!TOKEN) {
  console.error('ERROR: Set GITHUB_TOKEN environment variable')
  process.exit(1)
}

const REPO = 'YanKristsov/PFTH2E'
const BRANCH = 'gh-pages'
const DIST_DIR = 'D:/Files/PTHFNDR/dist'

function request(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO}${apiPath}`,
      method,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'PF2E-Deploy'
      }
    }
    if (body) {
      options.headers['Content-Type'] = 'application/json'
    }
    const req = https.request(options, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) })
        } catch (e) {
          resolve({ status: res.statusCode, data })
        }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

function getFiles(dir, prefix = '') {
  const files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = `${dir}/${entry.name}`
    const relPath = `${prefix}${entry.name}`
    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath, `${relPath}/`))
    } else {
      files.push({ path: relPath, content: fs.readFileSync(fullPath).toString('base64') })
    }
  }
  return files
}

async function main() {
  const files = getFiles(DIST_DIR)
  console.log(`Found ${files.length} files to upload`)

  // Get current tree
  const refRes = await request('GET', `/git/refs/heads/${BRANCH}`)
  if (refRes.status !== 200) {
    console.log('Branch not found, creating...')
    const createRef = await request('POST', '/git/refs', {
      ref: `refs/heads/${BRANCH}`,
      sha: refRes.data?.object?.sha || ''
    })
    if (createRef.status !== 201) {
      console.log('Create ref error:', createRef.data)
      return
    }
  }

  // Create tree with all files
  const treeData = files.map(f => ({
    path: f.path,
    mode: '100644',
    type: 'blob',
    content: Buffer.from(f.content, 'base64').toString('utf8')
  }))

  const treeRes = await request('POST', '/git/trees', { tree: treeData })
  if (treeRes.status !== 201) {
    console.log('Tree error:', treeRes.data)
    return
  }
  console.log('Tree created:', treeRes.data.sha)

  // Create commit
  const commitRes = await request('POST', '/git/commits', {
    message: 'Deploy to GitHub Pages',
    tree: treeRes.data.sha
  })
  if (commitRes.status !== 201) {
    console.log('Commit error:', commitRes.data)
    return
  }
  console.log('Commit created:', commitRes.data.sha)

  // Update branch
  const updateRes = await request('PATCH', `/git/refs/heads/${BRANCH}`, {
    sha: commitRes.data.sha
  })
  console.log('Update ref:', updateRes.status, updateRes.data)

  // Enable Pages
  const pagesRes = await request('PATCH', '/pages', {
    source: { branch: BRANCH, path: '/' }
  })
  console.log('Pages:', pagesRes.status, pagesRes.data?.url || pagesRes.data?.message)

  console.log('\nDone! Site: https://yankristsov.github.io/PFTH2E/')
}

main().catch(e => console.error('Error:', e.message))