import type { Tag } from '../types'

export const builtinTags: Tag[] = [
  // quality
  { id: 'masterpiece', text: 'masterpiece', category: 'quality' },
  { id: 'best_quality', text: 'best quality', category: 'quality' },
  { id: 'highres', text: 'highres', category: 'quality' },
  { id: 'absurdres', text: 'absurdres', category: 'quality' },
  { id: 'ultra_detailed', text: 'ultra-detailed', category: 'quality' },
  { id: 'incredibly_absurdres', text: 'incredibly absurdres', category: 'quality' },
  { id: 'detailed_background', text: 'detailed background', category: 'quality' },

  // character
  { id: '1girl', text: '1girl', category: 'character', aliases: ['one girl'] },
  { id: '1boy', text: '1boy', category: 'character', aliases: ['one boy'] },
  { id: 'solo', text: 'solo', category: 'character' },
  { id: 'multiple_girls', text: 'multiple girls', category: 'character' },
  { id: 'multiple_boys', text: 'multiple boys', category: 'character' },
  { id: 'couple', text: 'couple', category: 'character' },

  // appearance
  { id: 'long_hair', text: 'long hair', category: 'appearance' },
  { id: 'short_hair', text: 'short hair', category: 'appearance' },
  { id: 'blue_eyes', text: 'blue eyes', category: 'appearance' },
  { id: 'red_eyes', text: 'red eyes', category: 'appearance' },
  { id: 'green_eyes', text: 'green eyes', category: 'appearance' },
  { id: 'blonde_hair', text: 'blonde hair', category: 'appearance' },
  { id: 'black_hair', text: 'black hair', category: 'appearance' },
  { id: 'white_hair', text: 'white hair', category: 'appearance' },
  { id: 'twintails', text: 'twintails', category: 'appearance' },
  { id: 'ponytail', text: 'ponytail', category: 'appearance' },

  // clothing
  { id: 'school_uniform', text: 'school uniform', category: 'clothing' },
  { id: 'dress', text: 'dress', category: 'clothing' },
  { id: 'armor', text: 'armor', category: 'clothing' },
  { id: 'hoodie', text: 'hoodie', category: 'clothing' },
  { id: 'skirt', text: 'skirt', category: 'clothing' },
  { id: 'suit', text: 'suit', category: 'clothing' },
  { id: 'kimono', text: 'kimono', category: 'clothing' },

  // expression
  { id: 'smile', text: 'smile', category: 'expression' },
  { id: 'open_mouth', text: 'open mouth', category: 'expression' },
  { id: 'sitting', text: 'sitting', category: 'expression' },
  { id: 'standing', text: 'standing', category: 'expression' },
  { id: 'looking_at_viewer', text: 'looking at viewer', category: 'expression' },
  { id: 'closed_eyes', text: 'closed eyes', category: 'expression' },
  { id: 'blush', text: 'blush', category: 'expression' },
  { id: 'crying', text: 'crying', category: 'expression' },

  // scene
  { id: 'outdoors', text: 'outdoors', category: 'scene' },
  { id: 'indoors', text: 'indoors', category: 'scene' },
  { id: 'classroom', text: 'classroom', category: 'scene' },
  { id: 'city', text: 'city', category: 'scene' },
  { id: 'night', text: 'night', category: 'scene' },
  { id: 'sunset', text: 'sunset', category: 'scene' },
  { id: 'beach', text: 'beach', category: 'scene' },
  { id: 'forest', text: 'forest', category: 'scene' },

  // style
  { id: 'anime', text: 'anime', category: 'style' },
  { id: 'realistic', text: 'realistic', category: 'style' },
  { id: 'watercolor', text: 'watercolor', category: 'style' },
  { id: 'pixel_art', text: 'pixel art', category: 'style' },
  { id: 'oil_painting', text: 'oil painting', category: 'style' },
  { id: 'illustration', text: 'illustration', category: 'style' },

  // lighting
  { id: 'dramatic_lighting', text: 'dramatic lighting', category: 'lighting' },
  { id: 'soft_light', text: 'soft light', category: 'lighting' },
  { id: 'backlight', text: 'backlight', category: 'lighting' },
  { id: 'rim_light', text: 'rim light', category: 'lighting' },
  { id: 'studio_lighting', text: 'studio lighting', category: 'lighting' },
  { id: 'natural_light', text: 'natural light', category: 'lighting' },

  // composition
  { id: 'close_up', text: 'close-up', category: 'composition' },
  { id: 'full_body', text: 'full body', category: 'composition' },
  { id: 'upper_body', text: 'upper body', category: 'composition' },
  { id: 'from_above', text: 'from above', category: 'composition' },
  { id: 'from_below', text: 'from below', category: 'composition' },
  { id: 'portrait', text: 'portrait', category: 'composition' },

  // negative
  { id: 'lowres', text: 'lowres', category: 'negative' },
  { id: 'bad_hands', text: 'bad hands', category: 'negative' },
  { id: 'blurry', text: 'blurry', category: 'negative' },
  { id: 'watermark', text: 'watermark', category: 'negative' },
  { id: 'text', text: 'text', category: 'negative' },
  { id: 'error', text: 'error', category: 'negative' },
  { id: 'cropped', text: 'cropped', category: 'negative' },
  { id: 'worst_quality', text: 'worst quality', category: 'negative' },
  { id: 'low_quality', text: 'low quality', category: 'negative' },
  { id: 'normal_quality', text: 'normal quality', category: 'negative' },
]
