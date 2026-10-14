import { describe, expect, it } from 'vitest'
import { datasetMediaUrl, mapDatasetMuscle, toCatalogExercise } from './muscleTaxonomy.js'

describe('mapDatasetMuscle', () => {
  it('mapea body_part del dataset a grupos internos', () => {
    expect(mapDatasetMuscle('chest', 'pectorals')).toBe('chest')
    expect(mapDatasetMuscle('back', 'lats')).toBe('back')
    expect(mapDatasetMuscle('upper legs', 'glutes')).toBe('legs')
    expect(mapDatasetMuscle('lower legs', 'calves')).toBe('legs')
    expect(mapDatasetMuscle('shoulders', 'delts')).toBe('shoulders')
    expect(mapDatasetMuscle('upper arms', 'biceps')).toBe('arms')
    expect(mapDatasetMuscle('lower arms', 'forearms')).toBe('arms')
    expect(mapDatasetMuscle('waist', 'abs')).toBe('core')
    expect(mapDatasetMuscle('cardio', '')).toBe('core')
    expect(mapDatasetMuscle('neck', '')).toBe('shoulders')
  })

  it('usa target si body_part no encaja', () => {
    expect(mapDatasetMuscle('', 'pectoralis major')).toBe('chest')
    expect(mapDatasetMuscle('unknown', 'hamstrings')).toBe('legs')
    expect(mapDatasetMuscle('misc', 'triceps')).toBe('arms')
  })

  it('cae a core por defecto', () => {
    expect(mapDatasetMuscle('', '')).toBe('core')
    expect(mapDatasetMuscle('something else', 'mystery')).toBe('core')
  })
})

describe('datasetMediaUrl', () => {
  it('deja URLs absolutas y construye raw de GitHub para paths locales', () => {
    expect(datasetMediaUrl('https://cdn.example/a.gif')).toBe('https://cdn.example/a.gif')
    expect(datasetMediaUrl('images/0001-abc.jpg')).toBe(
      'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0001-abc.jpg',
    )
    expect(datasetMediaUrl('')).toBeNull()
  })
})

describe('toCatalogExercise', () => {
  it('asigna id ext_ y source dataset', () => {
    const row = toCatalogExercise({
      id: '0001',
      name: '3/4 sit-up',
      body_part: 'waist',
      target: 'abs',
      equipment: 'body weight',
      image: 'images/0001-2gPfomN.jpg',
      gif_url: 'videos/0001-2gPfomN.gif',
      instructions: { es: 'Túmbate', en: 'Lie flat' },
      secondary_muscles: ['hip flexors'],
    })
    expect(row.id).toBe('ext_0001')
    expect(row.source).toBe('dataset')
    expect(row.muscleGroup).toBe('core')
    expect(row.imageUrl).toContain('images/0001-2gPfomN.jpg')
    expect(row.gifUrl).toContain('videos/0001-2gPfomN.gif')
    expect(row.instructionsEs).toBe('Túmbate')
  })
})
