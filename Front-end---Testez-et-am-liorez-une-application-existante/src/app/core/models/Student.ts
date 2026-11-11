// Correspond à StudentResponseDTO côté back
export interface Student {
  id: number,
  firstName: string,
  lastName: string,
  email: string
}

// Correspond à StudentRequestDTO côté back (création et modification)
export interface StudentRequest {
  firstName: string,
  lastName: string,
  email: string
}
