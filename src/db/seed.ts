import { da } from 'zod/locales'
import { db } from './connection.ts'
import { users, habits, entries, tags, habitTags } from './schema.ts'

const seed = async () => {
  console.log('🌱 Starting database seed....')

  try {
    console.log('Clearing existing data...')
    await db.delete(users)
    await db.delete(entries)
    await db.delete(habits)
    await db.delete(tags)
    await db.delete(habitTags)

    console.log('Creating demo users...')
    const [demoUser] = await db
      .insert(users)
      .values({
        email: 'demo@app.com',
        password: 'password',
        username: 'demo',
        firstName: 'demo',
        lastName: 'person',
      })
      .returning()

    console.log('Creating tags...')
    const [healthTag] = await db
      .insert(tags)
      .values({
        name: 'Health',
        color: '#f0f0f0',
      })
      .returning()

    console.log('Creating habit...')
    const [exerciseHabit] = await db
      .insert(habits)
      .values({
        userId: demoUser.id,
        name: 'Exercise',
        description: 'Daily workout',
        frequency: 'daily',
        targetCount: 1,
      })
      .returning()

    await db.insert(habitTags).values({
      habitId: exerciseHabit.id,
      tagId: healthTag.id,
    })

    console.log('Adding completion entries')

    const today = new Date()
    today.setHours(12, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      await db.insert(entries).values({
        habitId: exerciseHabit.id,
        completionDate: date,
      })
    }

    console.log('✅ Database seeded successfully')
    console.log('user credentials:')
    console.log(`email: ${demoUser.email}`)
    console.log(`username: ${demoUser.username}`)
    console.log(`password: ${demoUser.password}`)
  } catch (e) {
    console.error('❌ seed failed', e)
    process.exit(1)
  }
}

// if somebody is running this file directly from terminal
// Use a more robust check that works with direct `node`, `tsx` or other runners.
const isExecutedDirectly = (() => {
  try {
    const url = import.meta.url || ''
    const argv1 = process.argv && process.argv[1] ? String(process.argv[1]) : ''
    // Typical Node: import.meta.url === `file://${process.argv[1]}`
    if (url === `file://${argv1}`) return true
    // Runners like `tsx` may change process.argv, so also check for seed filename in either value
    if (url.endsWith('/src/db/seed.ts') || url.endsWith('/src\\db\\seed.ts'))
      return true
    if (argv1.endsWith('src/db/seed.ts') || argv1.endsWith('src\\db\\seed.ts'))
      return true
  } catch (e) {
    // ignore and treat as not direct
  }
  return false
})()

if (isExecutedDirectly) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export default seed
