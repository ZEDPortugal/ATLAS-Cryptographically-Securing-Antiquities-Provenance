import { NextResponse } from 'next/server'
import { getAllAntiques } from '@/lib/antiqueStore'
import { getChainHeight } from '@/lib/db'

export const runtime = 'nodejs'
export const revalidate = 0

export async function GET() {
  try {
    const antiques = await getAllAntiques()
    const chainHeight = await getChainHeight()

    const totalAntiques = antiques.length
    const verifiedItems = antiques.filter(
      (antique) => antique.data.verification && antique.data.verification.status === 'Verified'
    ).length

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
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
