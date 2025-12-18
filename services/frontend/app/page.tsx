'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const RECOMMENDATION_URL = process.env.NEXT_PUBLIC_RECOMMENDATION_URL || 'http://localhost:5000'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
}

interface Recommendation {
  id: number
  score: number
}

interface RecommendationResponse {
  user_id: string
  recommended_products: Recommendation[]
  algorithm: string
  timestamp: number
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchRecommendations('user123')
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get<Product[]>(`${API_URL}/api/products`)
      setProducts(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to load products')
      setLoading(false)
    }
  }

  const fetchRecommendations = async (userId: string) => {
    try {
      const response = await axios.get<RecommendationResponse>(
        `${RECOMMENDATION_URL}/api/recommendations/${userId}`
      )
      setRecommendations(response.data.recommended_products || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-800">
            DevOps Microservices Platform
          </h1>
          <p className="text-gray-600 mt-2">
            Kubernetes • Docker • CI/CD • Monitoring
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Products Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Products</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              No products available. Add some products to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-indigo-600">
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                  <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full">
                    {product.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recommendations Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Recommended for You
          </h2>
          
          {recommendations.length === 0 ? (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              No recommendations available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">
                      Product ID: {rec.id}
                    </span>
                    <span className="text-sm font-medium text-indigo-600">
                      {(rec.score * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${rec.score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Health Status */}
        <section className="mt-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              System Health
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">API Service: Online</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Recommendation: Online</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Database: Connected</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>Built with Next.js, Kubernetes, Docker, and ❤️</p>
          <p className="text-sm text-gray-400 mt-2">
            DevOps Microservices Platform | Production-Ready Architecture
          </p>
        </div>
      </footer>
    </div>
  )
}