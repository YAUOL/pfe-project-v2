package com.recrutement.backend.repository;

import com.recrutement.backend.model.Offre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OffreRepository extends JpaRepository<Offre, Long> {
    
    List<Offre> findByRecruteurId(Long recruteurId);
    
    List<Offre> findByActiveTrue();
    
    List<Offre> findByActiveFalse();
    
    @Query("SELECT o FROM Offre o WHERE LOWER(o.titre) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(o.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(o.localisation) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Offre> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT COUNT(o) FROM Offre o WHERE o.recruteur.id = :recruteurId")
    long countByRecruteurId(@Param("recruteurId") Long recruteurId);
    
    @Query("SELECT COUNT(o) FROM Offre o WHERE o.active = true")
    long countActiveOffres();
}