const config = {
  totalItems: 100,
  itemsPerPage: 5,
  maxVisiblePages: 3,
  currentPage: 1,
}

let totalPages = Math.ceil(config.totalItems / config.itemsPerPage)
let allPostData = []
let filteredData = []
let searchTerm = ''
const debounce = (func, timeout = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}
const searchInput = document.getElementById('search-bar')
searchInput.addEventListener(
  'input',
  debounce(() => {
    searchTerm = searchInput.value.toLowerCase()
    filteredData = allPostData.filter(
      item =>item.title.toLowerCase().includes(searchTerm) || item.body.toLowerCase().includes(searchTerm)
    )
    if (filteredData.length > 0 || searchTerm.trim()) {
      config.totalItems = filteredData.length
      totalPages = Math.ceil(config.totalItems / config.itemsPerPage)
      config.currentPage = 1
    }
    updateContent()
    generatePagination()
  })
)
const input = document.getElementById('input-field')
input.addEventListener('input', () => {
  config.itemsPerPage = parseInt(input.value) || 1
  config.currentPage = 1
  if (allPostData.length > 0) {
    config.totalItems = filteredData ? filteredData.length : allPostData.length
    totalPages = Math.ceil(config.totalItems / config.itemsPerPage)
  }
  updateContent()
  generatePagination()
})

async function updateContent() {
  const start = (config.currentPage - 1) * config.itemsPerPage
  try {
    if (allPostData.length === 0) {
      const result = await axios.get(
        'https://jsonplaceholder.typicode.com/posts'
      )
      allPostData = result.data
      config.totalItems = allPostData.length
      totalPages = Math.ceil(config.totalItems / config.itemsPerPage)
    }
    const actualData = searchTerm ? filteredData : allPostData
    document.getElementById('tableBody').innerHTML = actualData.length > 0 ? actualData.slice(start, start + config.itemsPerPage)
            .map((item, index) =>`<tr>
                            <td class="no-cell">${start + index  + 1}</td>
                            <td class="id-cell">${item.id}</td>
                            <td class="title-cell">${
                              item.title.includes(searchTerm) && searchTerm
                                ? `${item.title.slice(0,item.title.indexOf(searchTerm))}
                                <span class="highlight">${searchTerm}</span>
                                ${item.title.slice(item.title.indexOf(searchTerm) +searchTerm.length)}`
                                : item.title
                            }</td>
                            <td class="detail-cell">${
                              item.body.includes(searchTerm) && searchTerm
                                ? `${item.body.slice(0,item.body.indexOf(searchTerm))}
                                <span class="highlight">${searchTerm}</span>
                                ${item.body.slice(item.body.indexOf(searchTerm) +searchTerm.length)} `
                                : item.body
                            }</td>
                    </tr>`
            ).join('')
        : `<tr><td colspan="3" class="loading">No data found</td></tr>`
  } catch (err) {
    console.log(err)
  }
}

function generatePagination() {
  if (totalPages === 0) {
    document.getElementById('pagination').innerHTML = ''
    return
  }
  const { currentPage, maxVisiblePages } = config
  let start = Math.max(1,Math.floor(currentPage - Math.floor(maxVisiblePages / 2)))
  let end = Math.min(totalPages, start + maxVisiblePages - 1)
  let html = `<button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>❮</button>`

  if (start > 1) html += `<button onclick="goToPage(1)">1</button>${start > 2 ? '<span class="ellipsis">...</span>' : ''}`

  for (let i = start; i <= end; i++) 
    html += `<button onclick="goToPage(${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`

  if (end < totalPages)
    html += `${
      end < totalPages - 1 ? '<span class="ellipsis">...</span>' : ''
    }<button onclick="goToPage(${totalPages})">${totalPages}</button>`

  html += `<button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>❯</button>`
  document.getElementById('pagination').innerHTML = html
}

const goToPage = page => {
  if (page >= 1 && page <= totalPages && page !== config.currentPage) {
    config.currentPage = page
    updateContent()
    generatePagination(totalPages)
  }
}

updateContent()
generatePagination()
