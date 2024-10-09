import { WebGLRenderer, 
  OrthographicCamera, 
  Scene, 
  Color, 
  SRGBColorSpace,
  Clock,
  Vector2,
  TextureLoader
} from 'three'
import { RainyWindow } from './rainywindow.js'

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas: undefined,
})
const getSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight
})
const { width, height } = getSize()
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(width, height)
renderer.setClearColor('#000')
renderer.outputColorSpace = SRGBColorSpace
document.body.appendChild(renderer.domElement)

const scene = new Scene()
scene.background = new Color(0, 0, 0)

const camera = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -10, 1000)
scene.add(camera)

const rainyWindow = new RainyWindow({
  resolution: new Vector2(height / width, 1)
})
scene.add(rainyWindow)

const clock = new Clock()

const loader = new TextureLoader()

loader.loadAsync('./bg.png').then(texture => {
  rainyWindow.setTexture(texture)
})

const update = () => {
  const time = clock.getElapsedTime()
  rainyWindow.update(time)
  renderer.render(scene, camera)
  requestAnimationFrame(update)
}

update()
