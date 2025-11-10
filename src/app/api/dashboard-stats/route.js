import { NextResponse } from 'next/server'
import { getAntiqueCount, getChainHeight } from '@/lib/db'

export const runtime = 'nodejs'
export const revalidate = 0

export async function GET() {
  try {
    const totalAntiques = await getAntiqueCount()
    const chainHeight = await getChainHeight()

    // Since we don't have a verification status field yet, 
    // we'll consider all registered antiques as verified (on blockchain)
    const verifiedItems = totalAntiques

    return NextResponse.json({
      success: true,
      stats: {
        totalAntiques,
        verifiedItems,
        chainHeight,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    )
  }
}
